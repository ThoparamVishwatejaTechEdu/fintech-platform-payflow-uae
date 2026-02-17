FROM eclipse-temurin:19-jdk

WORKDIR /app

COPY target/notification-service-*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java","-jar","app.jar"]
