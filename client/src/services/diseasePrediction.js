import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

class DiseasePredictionService {
    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    async getSymptoms() {
        try {
            const response = await this.client.get('/symptoms');
            return response.data.symptoms;
        } catch (error) {
            this.handleError('Failed to fetch symptoms', error);
        }
    }

    async predictDisease(symptoms) {
        try {
            const response = await this.client.post('/predict', { symptoms });
            return {
                disease: response.data.disease,
                precautions: response.data.precautions
            };
        } catch (error) {
            this.handleError('Failed to predict disease', error);
        }
    }

    handleError(message, error) {
        console.error(message, error);
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`${message}: ${errorMessage}`);
    }
}

// Create a singleton instance
const diseasePredictionService = new DiseasePredictionService();

export default diseasePredictionService;