import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import diseasePredictionService from '../../services/diseasePrediction';
import Select from 'react-select';

const DiseasePrediction = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch symptoms on component mount
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        setLoading(true);
        const symptomsList = await diseasePredictionService.getSymptoms();
        setSymptoms(symptomsList.map(symptom => ({ 
          value: symptom, 
          label: symptom.replace(/_/g, ' ').split(' ')
                         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                         .join(' ')
        })));
        setError('');
      } catch (err) {
        setError('Failed to load symptoms: ' + (err.message || 'Unknown error'));
        console.error('Error fetching symptoms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSymptoms();
  }, []);

  // Handle prediction request
  const handlePredict = async () => {
    if (selectedSymptoms.length < 3) {
      setError('Please select at least 3 symptoms for accurate prediction');
      return;
    }

    try {
      setPredicting(true);
      setError('');
      
      const result = await diseasePredictionService.predictDisease(
        selectedSymptoms.map(s => s.value)
      );
      
      setPrediction(result);
    } catch (err) {
      setError('Prediction failed: ' + (err.message || 'Unknown error'));
      console.error('Error during prediction:', err);
    } finally {
      setPredicting(false);
    }
  };

  // Handle symptom selection
  const handleSymptomChange = (selected) => {
    setSelectedSymptoms(selected || []);
    // Clear previous prediction when symptoms change
    if (prediction) setPrediction(null);
  };

  // Reset the form
  const handleReset = () => {
    setSelectedSymptoms([]);
    setPrediction(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Disease Prediction</h1>
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Your Symptoms
          </label>
          
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Select
              isMulti
              name="symptoms"
              options={symptoms}
              className="basic-multi-select"
              classNamePrefix="select"
              value={selectedSymptoms}
              onChange={handleSymptomChange}
              placeholder="Search and select symptoms..."
              noOptionsMessage={() => "No matching symptoms found"}
              isDisabled={predicting}
            />
          )}
          
          <p className="mt-2 text-sm text-gray-500">
            Select at least 3 symptoms for accurate prediction. You can select up to 10 symptoms.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handlePredict}
            disabled={selectedSymptoms.length < 3 || predicting || loading}
            className={`px-4 py-2 rounded-md flex items-center justify-center ${
              selectedSymptoms.length < 3 || predicting || loading
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {predicting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Predict Disease'
            )}
          </button>
          
          <button
            onClick={handleReset}
            disabled={predicting || (selectedSymptoms.length === 0 && !prediction)}
            className={`px-4 py-2 rounded-md ${
              predicting || (selectedSymptoms.length === 0 && !prediction)
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Reset
          </button>
        </div>

        {prediction && (
          <div className="border rounded-md p-6 bg-blue-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Prediction Results</h2>
            
            <div className="mb-4">
              <div className="font-medium text-gray-700">Predicted Condition:</div>
              <div className="text-lg font-bold text-blue-700 mt-1">
                {prediction.disease.replace(/_/g, ' ')
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </div>
            </div>
            
            {prediction.precautions && prediction.precautions.length > 0 && (
              <div>
                <div className="font-medium text-gray-700 mb-2">Recommended Precautions:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {prediction.precautions.map((precaution, index) => (
                    <li key={index} className="text-gray-600">
                      {precaution.replace(/_/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-6 border-t pt-4">
              <p className="text-sm text-gray-500 italic">
                Note: This prediction is based on AI analysis and is not a substitute for professional medical advice.
                Please consult a healthcare professional for accurate diagnosis.
              </p>
              
              <button
                onClick={() => navigate('/doctors/search')}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Find a Doctor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseasePrediction;