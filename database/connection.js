const mongoose = require('mongoose');

const connection = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect("mongodb+srv://alvaro131998:Calcetin20.@cluster0.lqu1zl2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log('Database connected successfully');
    } catch (error) {
        console.log(error);
        throw new Error('Error connecting to database');
    }
}

module.exports = connection;
