from django.conf import settings
from rest_framework.viewsets import ModelViewSet
from .serializers import PostSerializer, LabelSerializer
from .models import Post
from rest_framework.permissions import AllowAny
from django.db.models import Q
import os 

# model 사용을 위함
import torch
import torchvision
from torchvision import transforms
from torch.utils.data import DataLoader
from torch.utils.data import Subset
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import random_split
from PIL import Image
import urllib.request
import random

# CRUD가 모두 들어간 API를 지원
class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = LabelSerializer
    user_name = None
    folder_path = None
    
    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(
            # "author" 필드가 현재 요청한 사용자 (self.request.user)와 동일한 값을 가지는 객체만 필터링
            #본인이 작성한 글만 볼 수 있도록 함.
            Q(author=self.request.user) 
        )
        return qs
    
    def perform_create(self, serializer):
        #유저 이름과 label 추출 완료
        user_name = self.request.user.username
        label_name = self.request.data.get('label_name')
        serializer.save(author=self.request.user)

        #TODO: model 사용 부분 #########################################################
        # modeling def
        def binary_acc(y_pred, y_test):
            y_pred_tag = torch.round(torch.sigmoid(y_pred))
            print(y_pred_tag)
            correct_results_sum = (y_pred_tag == y_test).sum().float()
            acc = correct_results_sum/y_test.shape[0]
            acc = torch.round(acc * 100)
            
            return acc
        
        # 학습 데이터 경로 설정
        media_root = settings.MEDIA_ROOT
        folder_path = os.path.join(media_root, user_name)
        print("================================================")
        print("학습데이터 경로>> ",folder_path)
        print("================================================")
        folder_path_test = 'C:/Users/yhb38/Desktop/Capstone2/capstone/Capstone_design2/capstone2/backend/media/test0524/'

        transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(), 
            transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
            ])

        epochs = 30
        # 각 미니 배치에 16개의 샘플이 포함됨
        batch_size = 32

        # 학습용 dataset
        dataset = torchvision.datasets.ImageFolder(root = folder_path, transform = transform)

        # 80% for training, 20% for validation
        train_ratio = 0.8  
        train_size = int(train_ratio * len(dataset))
        val_size = len(dataset) - train_size

        train_data, val_data = torch.utils.data.random_split(dataset, [train_size, val_size])

        # 테스트용 dataset
        test_data = torchvision.datasets.ImageFolder(root = folder_path_test, transform = transform)


        # num_workers : 데이터 로드에 사용할 하위 프로세스 수
        trainloader = torch.utils.data.DataLoader(train_data, batch_size=batch_size, shuffle=True, num_workers=2)

        validationloader = DataLoader(val_data, batch_size=batch_size*2, shuffle=False, num_workers=2)

        testloader = torch.utils.data.DataLoader(test_data, batch_size=batch_size, shuffle=False, num_workers=2)


        classes = ('cleanApple', 'Not_cleanApple')

        ## loss function의 train_loss 와 validation_loss
        loss_train = []
        loss_validation = []

        ## train & validation accuracy 
        train_acc_list = []
        val_acc_list = []

        # 모델가져오기
        model = torchvision.models.mobilenet_v2(pretrained=True)
        num_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_features, 1)

        ## CUDA 기기가 존재한다면, CUDA 장치를 출력:
        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        print(device)
        model.to(device)


        # 3. 손실 함수 정의
        target = torch.ones([batch_size], dtype=torch.float32)  # 64 classes, batch size = 10
        output = torch.full([batch_size], 1.5)  # A prediction (logit)
        criterion = torch.nn.BCEWithLogitsLoss()
        criterion(output, target)

        optimizer = optim.Adam(model.parameters(), lr=0.001)


        # 4. 학습용 데이터를 사용하여 신경망 학습
        n = len(trainloader)
        m = len(validationloader)

        for epoch in range(epochs):   # 데이터셋을 수차례 반복합니다.
            running_loss = 0.0
            correct_predictions = 0
            total_predictions = 0

            model.train()
            # Training Phase
            for i, data in enumerate(trainloader, 0):
                # [inputs, labels]의 목록인 data로부터 입력을 받은 후;
                # inputs, labels = data # cuda 사용
                inputs, labels = data[0].to(device), data[1].to(device)
                labels = labels.unsqueeze(1)

                # 변화도(Gradient) 매개변수를 0으로 만들고
                optimizer.zero_grad()

                # 순전파 + 역전파 + 최적화를 한 후
                outputs = model(inputs)
                loss = criterion(outputs, labels.float())
                acc = binary_acc(outputs, labels.float())
                loss.backward()
                optimizer.step()

                # 통계를 출력
                running_loss += loss.item()

                # training accuracy 계산
                _, predicted = torch.max(outputs.data, 1)
                total_predictions += labels.size(0)
                correct_predictions += (predicted == labels).sum().item()

                if i % n == n-1:
                    print(f'Training : [{epoch + 1}, {i + 1:5d}] loss: {running_loss / n:.3f} accuracy: {correct_predictions / total_predictions:.3f}')
                    loss_train.append(running_loss / n)
                    # train data 정확도 기록하는 부분
                    train_acc_list.append(correct_predictions / total_predictions)
                    running_loss = 0.0
            
            with torch.no_grad():
                # evaluation mode
                model.eval()

                # Validation Phase
                for i, data in enumerate(validationloader, 0):
                    inputs, labels = data[0].to(device), data[1].to(device)
                    labels = labels.unsqueeze(1)
                    # optimizer.zero_grad()
                    outputs = model(inputs)
                    loss = criterion(outputs, labels.float())

                    # validation accuracy 계산
                    _, predicted = torch.max(outputs.data, 1)
                    total_predictions += labels.size(0)
                    correct_predictions += (predicted == labels).sum().item()
                    
                    # 통계를 출력
                    running_loss += loss.item()
                    if i % m == m-1:
                        print(f'Validation : [{epoch + 1}, {i + 1:5d}] loss: {running_loss / m:.3f} accuracy: {correct_predictions / total_predictions:.3f}')
                        loss_validation.append(running_loss / m)
                        # validation data 정확도 기록하는 부분
                        val_acc_list.append(correct_predictions / total_predictions)
                        running_loss = 0.0

        print('Finished Training\n')

        # # 학습한 모델 저장
        PATH = './temp_model.pth'
        torch.save(model.state_dict(), PATH)

        # 각 분류(class)에 대한 예측값 계산을 위해 준비
        correct_pred = {classname: 0 for classname in classes}
        total_pred = {classname: 0 for classname in classes}

        with torch.no_grad():
            for data in testloader:
                images, labels = data
                images = images.cuda()
                labels = labels.cuda()
                outputs = model(images)
                _, predictions = torch.max(outputs, 1)
                # 각 분류별로 올바른 예측 수를 모읍니다
                for label, prediction in zip(labels, predictions):
                    if label == prediction:
                        correct_pred[classes[label]] += 1
                    total_pred[classes[label]] += 1

        # 각 분류별 정확도(accuracy)를 출력합니다
        for classname, correct_count in correct_pred.items():
            accuracy = 100 * float(correct_count) / total_pred[classname]
            print(f'Accuracy for class: {classname:5s} is {accuracy:.1f} %')

        print("Finished Testing\n")
    #TODO: model 사용 부분 #########################################################

        return super().perform_create(serializer)