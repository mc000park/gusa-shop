FROM node:20-alpine AS build

# 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 컨테이너 내부로 package.json 파일들을 복사
COPY package*.json ./

# package.json 및 package-lock.json 파일에 명시된 의존성 패키지 설치
RUN npm install

# 호스트 머신의 현재 디렉토리 파일들을 컨테이너 내부로 전부 복사
COPY . .
RUN npm run build

FROM nginx:alpine

# 이전 빌드 단계에서 빌드한 결과물을 /usr/share/nginx/html 디렉토리로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 기본 nginx 설정 파일을 삭제한다. (custom 설정과 충돌 방지)
RUN rm /etc/nginx/conf.d/default.conf

# custom 설정파일을 컨테이너 내부로 복사한다.
COPY /nginx/nginx.conf /etc/nginx/conf.d/default.conf

# 컨테이너 3000번 포트를 열어준다
EXPOSE 3000

# nginx 서버를 실행한다.
CMD ["nginx", "-g", "daemon off;"]