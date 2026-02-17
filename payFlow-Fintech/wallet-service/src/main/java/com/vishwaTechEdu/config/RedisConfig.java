//package com.vishwaTechEdu.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
//import org.springframework.data.redis.core.RedisTemplate;
//
//@Configuration
//public class RedisConfig {
//
//    @Bean
//    public LettuceConnectionFactory redisConnectionFactory() {
//        return new LettuceConnectionFactory();
//    }
//
//    @Bean
//    public RedisTemplate<String,Object> redisTemplate() {
//        RedisTemplate<String,Object> t = new RedisTemplate<>();
//        t.setConnectionFactory(redisConnectionFactory());
//        return t;
//    }
//}
