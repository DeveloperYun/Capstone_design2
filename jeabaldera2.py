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
accuracy_training = 0.0
best_loss = 10**9
early_stop_limit = 5
early_stop_check = 0

## 이진분류 변환 함수
def binary_acc(y_pred, y_test):
    y_pred_tag = torch.round(torch.sigmoid(y_pred))
    correct_results_sum = (y_pred_tag == y_test).sum().float()
    acc = correct_results_sum/y_test.shape[0]
    acc = torch.round(acc * 100)
    
    return acc

## 구글드라이브 연동(추후변동-백엔드)
drive.mount("/content/drive", force_remount=True)

folder_path = '/content/drive/MyDrive/dataset/training_set3'
folder_path_test = '/content/drive/MyDrive/dataset/test_set3'

## 2개의 레이블 이름 가져오기
# Get the list of folders in the dataset directory
folders = os.listdir(folder_path)

# Iterate over the folders
for folder in folders:
    folder_path_new = os.path.join(folder_path, folder)
    
    # Extract the label from the folder name
    label = folder
    print(label)
    # Append the label to the 'labels' list
    labels.append(label)

# Convert the 'labels' list to a numpy array
classes = np.array(labels)
print(classes)

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

        running_loss += loss.item()
        running_acc += acc.item()
        accuracy_training = round((running_acc / n), 2)

        # 학습 통계를 출력
        if i % n == n-1:
            print(f'Training : [{epoch + 1}, {i + 1:5d}] loss: {running_loss / n:.3f} accuracy: {accuracy_training}')
            loss_train.append(running_loss / n)
            running_loss = 0.0
            running_acc = 0.0
    
    # evaluation mode
    model.eval()
    with torch.no_grad():
        # Validation Phase
        for i, data in enumerate(validationloader, 0):
            inputs, labels = data[0].to(device), data[1].to(device)
            labels = labels.unsqueeze(1)
            # optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels.float())
            acc = binary_acc(outputs, labels.float())

            running_loss += loss.item()
            running_acc += acc.item()

            # early stopping 여부 체크
            if running_loss > best_loss:      # loss가 개선되지 않은 경우
                early_stop_check += 1

            else:                             # loss가 개선된 경우
                best_loss = running_loss
                early_stop_check = 0
            
            # 검증 통계를 출력
            if i % m == m-1:
                print(f'Validation : [{epoch + 1}, {i + 1:5d}] loss: {running_loss / m:.3f} accuracy: {running_acc / m:.3f}')
                loss_validation.append(running_loss / m)
                running_loss = 0.0
                running_acc = 0.0

    # early stopping 조건 만족 시 조기 종료
    if early_stop_check >= early_stop_limit:
        print("Early stooping is applied...")
        break
        
    # 5 epoch 마다 진행률 표시
    if (epoch+1) % 5 == 0:
        progress = ((epoch+1) / 30) * 100
        print(f'Progressing : {progress:.2f}%')

print(f'Final Accuracy : {accuracy_training}%')
print('Finished Training\n')

# 학습한 모델 저장
PATH = './apple.pth'
torch.save(model.state_dict(), PATH)

# 저장된 모델 불러오기
model.load_state_dict(torch.load('apple.pth'))

# 모델 테스트
label_list = []
y_test = []
y_acc = []

accuracy_test = 0.0
model.eval()
with torch.no_grad():
    for images, label in testloader:
        images = images.to(device)
        label_pred = model(images)
        label_pred = torch.sigmoid(label_pred)
        y_acc.append(label_pred.cpu().numpy())

        label_tag = torch.round(label_pred)
        label_list.append(label_tag.cpu().numpy())
        y_test.append(label.cpu().numpy())

y_acc = [a.squeeze().tolist() for a in y_acc]
y_test = [a.squeeze().tolist() for a in y_test]
label_list = [a.squeeze().tolist() for a in label_list]

print(y_acc)

# 레이블이름과 예측정확률 출력
for i in range(len(test_data)):
    if y_acc[i] < 0.5:
      y_acc[i] = round((1 - y_acc[i]), 2)
    else :
      y_acc[i] = round(y_acc[i], 2)
    print(y_acc[i]*100)
    print(classes[int(label_list[i])])

print("Finished Testing\n")
