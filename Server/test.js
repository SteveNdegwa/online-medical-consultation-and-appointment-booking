const mysql = require('mysql');
const dotenv = require('dotenv');
const { json } = require('express');
dotenv.config();



const pool = mysql.createPool({
    host: process.env.HOST,
    port: process.env.DB_PORT,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD

});

pool.getConnection(function (err, connection) {
    if (err) throw err;
    else {
        console.log("Connection created with Mysql successfully");

        console.log('db ' + connection.state);

        // var sql = "CREATE TABLE users (user_id INT NOT NULL AUTO_INCREMENT, user_name VARCHAR(255), password VARCHAR(255) , account_type VARCHAR(255), PRIMARY KEY (user_id))";
        // connection.query(sql, function(err, result){
        //     if(err) throw err;
        //     console.log("Table Created");
        // }); 

        // var sql = "CREATE TABLE doctor_details (user_id INT NOT NULL, name VARCHAR(255), gender VARCHAR(255) , dob VARCHAR(255), email VARCHAR(255), phone_no VARCHAR(255), licence_no VARCHAR(255), cancer_speciality VARCHAR(1000), clinic_location VARCHAR(255), clinic_phone_no VARCHAR(255), clinic_email VARCHAR(255) ,PRIMARY KEY (user_id))";
        // connection.query(sql, function(err, result){
        //     if(err) throw err;
        //     console.log("Table Created");
        // }); 

        // var sql = "CREATE TABLE patient_details (user_id INT NOT NULL, name VARCHAR(255), gender VARCHAR(255), dob VARCHAR(255), email VARCHAR(255), phone_no VARCHAR(255), location VARCHAR(255), cancer_type VARCHAR(255), cancer_stage VARCHAR(255), lifestyle_diseases VARCHAR(255), PRIMARY KEY (user_id))";
        // connection.query(sql, function(err, result){
        //     if(err) throw err;
        //     console.log("Table Created");
        // });

        // var sql = "CREATE TABLE appointments (appointment_id INT NOT NULL AUTO_INCREMENT, patient_id INT NOT NULL, doctor_id INT NOT NULL, date VARCHAR(255), time VARCHAR(255), PRIMARY KEY (appointment_id))";
        // connection.query(sql, function(err, result){
        //     if(err) throw err;
        //     console.log("Table Created");
        // }); 

        // var sql = "CREATE TABLE appointment_slots (doctor_id INT, day VARCHAR(255), slots JSON)";
        // connection.query(sql, function(err, result){
        //     if(err) throw err;
        //     console.log("Table Created");
        // }); 


        // var sql = "INSERT INTO appointments (patient_id, doctor_id, date, time) VALUES(?)";
        // const values = [2, 4, "27-02-2022", "12.00"];
        // connection.query(sql,[values], function(err, result){
        //     if(err) throw err;
        //     console.log("Record Inserted");
        // });

        // var sql = "DROP TABLE appointments";
        // connection.query(sql, function(err, result){
        //     if(err) throw err;
        //     console.log("Table deleted");
        // });

        // var sql = "DELETE FROM patient_details";
        // connection.query(sql, function(err, result){
        //     if(err) throw err;
        //     console.log("users deleted");
        // });



        // var sql = "INSERT INTO users (user_name, password) VALUES('steven ndegwa', 'winster19')";
        // connection.query(sql, function(err, result){
        //     if(err) throw err;
        //     console.log("Record Inserted");
        // });

        // var sql = "SELECT str_to_date('040710$','%m%d%y') FROM appointments";
        // connection.query(sql, function(err, result, fields){
        //     if(err) throw err;
        //     console.log(result);
        // });

        // var sql = "SELECT * FROM appointments";
        // connection.query(sql, function(err, result, fields){
        //     if(err) throw err;
        //     console.log(result);
        // });


        // let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        // const date = new Date('2023-04-12');
        // date.setHours("18","40");
        // console.log(date);
        // // const day = date.getDay();
        // // // Sunday - Saturday : 0 - 6

        // const nowDate = new Date();
        // console.log(nowDate);

        // if(nowDate.getTime() > date.getTime()){
        //     console.log("The day has already passed");
        // }else{
        //     console.log("The day is in the future");
        // }
        // console.log(weekdays[day]);

        // let time= "08:00";
        // console.log(time.slice(0,2));
        // console.log(time.slice(3,5));

         var sql = "CREATE TABLE payments (transaction_id VARCHAR(255),amount INT NOT NULL, timestamp INT NOT NULL, phone_no INT NOT NULL, PRIMARY KEY (transaction_id))";
        connection.query(sql, function(err, result){
            if(err) throw err;
            console.log("Table Created");
        }); 
    }
});