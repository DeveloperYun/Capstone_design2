import json
from django.conf import settings
from rest_framework.viewsets import ModelViewSet
from .serializers import PostSerializer, LabelSerializer
from .models import Post, Model
from rest_framework.permissions import AllowAny
from django.db.models import Q
import os 
from django.http import JsonResponse
import time, math

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
import numpy as np
from django.core.files import File
from django.contrib.auth import get_user_model

# CRUD가 모두 들어간 API를 지원
class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = LabelSerializer
    user_name = None
    datasets = None

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
        self.user_name = self.request.user.username
        self.dataset = self.request.data.get('dataset')

        user_name = self.user_name
        datasets = self.dataset

        print("$$ : ", user_name, datasets)
        serializer.save(author=self.request.user)
        return super().perform_create(serializer)
    
#TODO: model 사용 부분 #########################################################

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

classes = []

@method_decorator(csrf_exempt)
def train_model(request):
    print("==================> train 시작 ")
    labels = []
    def binary_acc(y_pred, y_test):
        y_pred_tag = torch.round(torch.sigmoid(y_pred))
        print(y_pred_tag)
        correct_results_sum = (y_pred_tag == y_test).sum().float()
        acc = correct_results_sum/y_test.shape[0]
        acc = torch.round(acc * 100)
        
        return acc
    
    if request.method == 'POST':
        data = json.loads(request.body)
        user_name = data.get('username')
        datasets = data.get('dataset')
    print("================================================")
    print(">> ",user_name, " + ", datasets)
    print("================================================")


    # 학습 데이터 경로 설정
    media_root = settings.MEDIA_ROOT
    folder_path = os.path.join(media_root, user_name, datasets)
    print("================================================")
    subfolders = [name for name in os.listdir(folder_path) if os.path.isdir(os.path.join(folder_path, name))]
    print("학습데이터 경로>> ",folder_path)
    print(subfolders)  # 하위 폴더 이름 출력
    print("================================================")
    #FIXME: folder_path_test = 'C:/Users/yhb38/Desktop/Capstone2/capstone/Capstone_design2/capstone2/backend/temp_test_folder/apple'
    labels = subfolders
    print(">> : ",labels)
    classes = np.array(labels)

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
    #FIXME: test_data = torchvision.datasets.ImageFolder(root = folder_path_test, transform = transform)


    # num_workers : 데이터 로드에 사용할 하위 프로세스 수
    trainloader = torch.utils.data.DataLoader(train_data, batch_size=batch_size, shuffle=True, num_workers=2)

    validationloader = DataLoader(val_data, batch_size=batch_size*2, shuffle=False, num_workers=2)

    #FIXME: testloader = torch.utils.data.DataLoader(test_data, batch_size=batch_size, shuffle=False, num_workers=2)

    ## loss function의 train_loss 와 validation_loss
    loss_train = []
    loss_validation = []

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

    #학습시간 측정 시작
    start_time = time.time()

    for epoch in range(epochs):   # 데이터셋을 수차례 반복합니다.
        running_loss = 0.0
        running_acc = 0.0
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
            running_acc += acc.item()

            if i % n == n-1:
                print(f'Training : [{epoch + 1}, {i + 1:5d}] loss: {running_loss / n:.3f} accuracy: {running_acc / n:.3f}')
                loss_train.append(running_loss / n)
                running_loss = 0.0
                running_acc = 0.0
        
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
                acc = binary_acc(outputs, labels.float())

                # 통계를 출력
                running_loss += loss.item()
                running_acc += acc.item()
                if i % m == m-1:
                    print(f'Validation : [{epoch + 1}, {i + 1:5d}] loss: {running_loss / m:.3f} accuracy: {running_acc / m:.3f}')
                    loss_validation.append(running_loss / m)
                    running_loss = 0.0
                    running_acc = 0.0
        # 5 epoch 마다 진행률 표시
        if (epoch+1) % 5 == 0:
            progress = ((epoch+1) / 30) * 100
            print(f'Progressing : {progress:.2f}%')

    end_time = time.time()
    training_time = round(end_time-start_time,2)
    print("학습시간 : ", training_time)
    #print("학습정확도 : ",running_acc)
    print('Finished Training\n')

    # # 학습한 모델 저장
    PATH = os.path.join(media_root, user_name, f"{datasets}.pth")
    torch.save(model.state_dict(), PATH)

    UserModel = get_user_model()
    user_instance = UserModel.objects.get(username=user_name)

    model_instance = Model()
    model_instance.author = user_instance  # 모델의 작성자 설정 (사용자 인증이 적용되어 있다고 가정)
    model_instance.name = datasets  # 모델 이름 설정
    model_instance.learning_time = training_time  # 학습 시간 설정
    model_instance.accuracy = '100%'  # 정확도 설정
    model_instance.file.save(f'{datasets}.pth', File(open(PATH, 'rb')))  # 모델 파일 저장
    model_instance.save()  # 모델 인스턴스를 데이터베이스에 저장
    
    return JsonResponse({'message': '모델 학습이 완료되었습니다.', 'training_time': training_time})

#TODO: 결과 확인하기 구현
@method_decorator(csrf_exempt)
def show_result(request):

    #FIXME: 결과확인용 이미지 (db모델에는 저장x)
    print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    if request.method == 'POST':
        print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

        image = request.FILES.get('image')
        username = request.POST.get('username')
        dataset = request.POST.get('dataset')
        username = username.strip('"')

        print("임시확인 : ",username,image,dataset)

        media_root = settings.MEDIA_ROOT
        file_path = os.path.join(media_root, username, 'temp','temp')
        print(">> ", file_path)

        # 폴더 생성
        os.makedirs(file_path, exist_ok=True)

        # 기존 파일 삭제
        for filename in os.listdir(file_path):
            file = os.path.join(file_path, filename)
            if os.path.isfile(file):
                os.remove(file)

        image_path = os.path.join(file_path, image.name)
        with open(image_path, 'wb') as f:
            for chunk in image.chunks():
                f.write(chunk)

        print("===============>test 시작")
        file_path = os.path.join(media_root, username, 'temp')
        folder_path_test = file_path
        
        transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(), 
            transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
            ])

        epochs = 30
        # 각 미니 배치에 16개의 샘플이 포함됨
        batch_size = 32
        test_data = torchvision.datasets.ImageFolder(root = folder_path_test, transform = transform)
        testloader = torch.utils.data.DataLoader(test_data, batch_size=batch_size, shuffle=False, num_workers=2)

        # 모델 가져오기 및 수정
        model = torchvision.models.mobilenet_v2(pretrained=True)
        num_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_features, 1)  # 출력 유닛을 1개로 수정

        # CUDA 장치 사용 여부 확인
        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        print(device)
        model.to(device)

        # 저장된 모델 불러오기
        PATH = os.path.join(media_root, username, f"{dataset}.pth")
        model.load_state_dict(torch.load(PATH))
        print("===============> model 가져오기 완료")

        # 모델 테스트
        label_list = []
        y_test = []

        model.eval()
        with torch.no_grad():
            for images, labels in testloader:
                images = images.to(device)
                label_pred = model(images)
                label_pred = torch.sigmoid(label_pred)
                label_tag = torch.round(label_pred)
                label_list.append(label_tag.cpu().numpy())
                y_test.append(labels.cpu().numpy())

        y_test = [a.squeeze().tolist() for a in y_test]
        label_list = [a.squeeze().tolist() for a in label_list]


        dataset_path = os.path.join(media_root, username, dataset)
        label_folders = os.listdir(dataset_path)

        classes = label_folders

        print(classes)
    
        for i in range(len(test_data)):
            # print(classes[int(label_list[i])])
            res = classes[int(label_list[i])]
        print("결과 : ",res)
        print("========> Finished Testing\n")

         # 예시로 JsonResponse로 응답을 반환합니다.
        response_data = {
            'message': res,
            'username': username,
            'image': image.name,
        }

        return JsonResponse(response_data)