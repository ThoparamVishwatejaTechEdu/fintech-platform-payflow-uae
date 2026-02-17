FROM eclipse-temurin:19-jdk

WORKDIR /app

COPY target/kyc-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java","-jar","app.jar"]
