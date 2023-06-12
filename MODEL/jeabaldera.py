import os
import numpy as np
import torch
import torchvision
from torchvision import transforms
from torch.utils.data import DataLoader
from torch.utils.data import Subset
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import matplotlib.pyplot as plt
from sklearn.metrics import f1_score
from torch.utils.data import random_split
from google.colab import drive
from PIL import Image
import urllib.request
import pandas as pd
import random

labels = []
progress = 0.0

## 이진분류 변환 함수
def binary_acc(y_pred, y_test):
    y_pred_tag = torch.round(torch.sigmoid(y_pred))
    correct_results_sum = (y_pred_tag == y_test).sum().float()
    acc = correct_results_sum/y_test.shape[0]
    acc = torch.round(acc * 100)
    
    return acc

## 구글드라이브 연동(추후변동-백엔드)
drive.mount("/content/drive", force_remount=True)

folder_path = '/content/drive/MyDrive/dataset/training_set4'
folder_path_test = '/content/drive/MyDrive/dataset/test_set5'

## 2개의 레이블 이름 가져오기
# Get the list of folders in the dataset directory
folders = os.listdir(folder_path)

# Iterate over the folders
for folder in folders:
    folder_path_new = os.path.join(folder_path, folder)
    
    # Extract the label from the folder name
    label = folder
    
    # Load the data from the folder (e.g., using image loading functions)
    # Append the data to the 'data' list
    # Append the label to the 'labels' list
    # data.append(load_data_from_folder(folder_path))
    labels.append(label)

# Convert the 'labels' list to a numpy array
classes = np.array(labels)


## 이미지 변환
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

testloader = torch.utils.data.DataLoader(test_data, batch_size=1, shuffle=False, num_workers=2)


# classes = ('꼭다리', '민머리')

## loss function의 train_loss 와 validation_loss
loss_train = []
loss_validation = []

## train & validation accuracy 
train_acc_list = []
val_acc_list = []

# 모델가져오기
model = torchvision.models.mobilenet_v2(weights=True)
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

        # # training accuracy 계산
        # _, predicted = torch.max(outputs.data, 1)
        # total_predictions += labels.size(0)
        # correct_predictions += (predicted == labels).sum().item()

        if i % n == n-1:
            print(f'Training : [{epoch + 1}, {i + 1:5d}] loss: {running_loss / n:.3f} accuracy: {running_acc / n:.3f}')
            loss_train.append(running_loss / n)
            # train data 정확도 기록하는 부분
            # train_acc_list.append(correct_predictions / total_predictions)
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

            # # validation accuracy 계산
            # _, predicted = torch.max(outputs.data, 1)
            # total_predictions += labels.size(0)
            # correct_predictions += (predicted == labels).sum().item()
            
            # 통계를 출력
            running_loss += loss.item()
            running_acc += acc.item()
            if i % m == m-1:
                print(f'Validation : [{epoch + 1}, {i + 1:5d}] loss: {running_loss / m:.3f} accuracy: {running_acc / m:.3f}')
                loss_validation.append(running_loss / m)
                # validation data 정확도 기록하는 부분
                # val_acc_list.append(correct_predictions / total_predictions)
                running_loss = 0.0
                running_acc = 0.0
    if (epoch+1) % 5 == 0:
        progress = ((epoch+1) / 30) * 100
        print(f'Progressing : {progress:.2f}%')
print('Finished Training\n')

# # 학습한 모델 저장
# PATH = './apple.pth'
# torch.save(model.state_dict(), PATH)

# # 저장된 모델 불러오기
# model.load_state_dict(torch.load('apple.pth'))

# # # 각 분류(class)에 대한 예측값 계산을 위해 준비
# # correct_pred = {classname: 0 for classname in classes}
# # total_pred = {classname: 0 for classname in classes}

# with torch.no_grad():
#     for data in testloader:
#         images, labels = data
#         images = images.cuda()
#         labels = labels.cuda()
#         outputs = model(images)
#         _, predictions = torch.max(outputs, 1)
#         # 각 분류별로 올바른 예측 수를 모읍니다
#         for label, prediction in zip(labels, predictions):
#             if label == prediction:
#                 correct_pred[classes[label]] += 1
#             total_pred[classes[label]] += 1

# # 각 분류별 정확도(accuracy)를 출력합니다
# for classname, correct_count in correct_pred.items():
#     accuracy = 100 * float(correct_count) / total_pred[classname]
#     print(f'Accuracy for class: {classname:5s} is {accuracy:.1f} %')

# 모델 테스트
label_list = []
y_test = []

model.eval()
with torch.no_grad():
    for images, label in testloader:
        images = images.to(device)
        label_pred = model(images)
        label_pred = torch.sigmoid(label_pred)
        label_tag = torch.round(label_pred)
        label_list.append(label_tag.cpu().numpy())
        y_test.append(label.cpu().numpy())

y_test = [a.squeeze().tolist() for a in y_test]
label_list = [a.squeeze().tolist() for a in label_list]

# # 예측레이블 & 실제레이블 동시에 출력
# print(label_list)
# print(y_test)


## 레이블이름 출력
for i in range(len(test_data)):
    # image, _ = test_data[i]  # Get the i-th image from the dataset
    # plt.imshow(image.permute(1, 2, 0))  # Permute dimensions for displaying with matplotlib
    # plt.axis('off')
    # plt.show()
    print(classes[int(label_list[i])])

# correct_pred = 0

# # 정확률 계산
# for i in range(len(y_test)):
#   if y_test[i] == label_list[i]:
#     correct_pred += 1
# print(f'Test Accuracy : {100 * (correct_pred/len(y_test))} %')

# for i in range(len(test_data)):
#   print(classes[int(label_list[i])])

print("Finished Testing\n")

#### 해야할 것 ####
# 1. 모델 어디다 저장?
# 2. 이미지 어떤 모양으로 출력?
