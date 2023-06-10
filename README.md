# 종합설계프로젝트2 3팀
---
### 프로젝트 소개
- 프로젝트명 : 머신러닝 모델 개발을 위한 노코드(no-code) 플랫폼 개발 
- 멘토 기업 : (주)데이터센트릭
- Notion : https://hexagonal-knot-7e4.notion.site/3-e433a2ca79764aac888870b857cb3d4b?pvs=4
- 소개
  - 코딩이나 인공지능에 대한 사전지식이 없어도 손 쉽고 빠르게 정확한 이진분류가 가능한 인공지능 모델링을 해볼 수 있는 노 코드 플랫폼

## 웹
- 사용한 툴
  - 개발 도구 : vscode, github, notion, conda 4.12.0, Colab
  - 사용 언어 : Python 3.9, javascript, MySQL
  - 사용 프레임워크 : Django 3.2.18 , React 18.2
  - 모델링 : Pytorch 2.0.1 + cu118 

- 시스템 구조도
![20230608_154929](https://github.com/DeveloperYun/Capstone_design2/assets/81633639/a074085b-dd6e-41c0-a9e0-3c34a21b9d0b)

- 유즈케이스 다이어그램
![KakaoTalk_20230605_171325262](https://github.com/DeveloperYun/Capstone_design2/assets/81633639/4d9155fd-eccf-4371-98bb-186b2054f5fb)

- 시퀀스 다이어그램
![KakaoTalk_20230607_002343052](https://github.com/DeveloperYun/Capstone_design2/assets/81633639/f8162ec1-460a-4372-aa99-fb71fec1fe69)

- 백 엔드 동작 요약 
![dd drawio](https://github.com/DeveloperYun/Capstone_design2/assets/81633639/bd547d9b-5b66-42a8-981e-bfef7a0fe150)



## 모델
---
### 벤치마킹 
- 8종의 모델을 선정하여 cifar-10 데이터셋을 사용하여 동일한 환경에서의 성능 비교 후 최종 모델 선정을 위한 실험 
- 
### 벤치마킹 결과 종합  #####(https://hexagonal-knot-7e4.notion.site/5a48f5837603404b8feba8e6bc414c38?pvs=4) 
![20230608_160428](https://github.com/DeveloperYun/Capstone_design2/assets/81633639/ea986f7d-2744-43d5-91af-9028d7415171) 

세진 : https://github.com/sejin1129/BenchMarking  
준수 : https://github.com/githeoheo/Pytorch-benchmarking.git  
해빈 : https://github.com/DeveloperYun/Pytorch_benchmark  
수현 : https://github.com/wjdtngus9536/AI_Benchmark_Test  

---
### 논문 소개
- [한국정보지능시스템학회] https://www.kiiss.or.kr/conference/conf/sub03.html
![20230608_160919](https://github.com/DeveloperYun/Capstone_design2/assets/81633639/52c8e1f2-c2c5-44e1-959d-3562a5a9bcaa)
![논문한짤](https://github.com/DeveloperYun/Capstone_design2/assets/81633639/2322d1ce-d2ca-4235-8fed-40e39aec417e)

---
### 회의록
  ##### https://www.notion.so/72c135fee5494b688630613c510c40b7?pvs=4
---
### 데모 영상
  ##### https://www.youtube.com/watch?v=nQkTkpfFr_0
