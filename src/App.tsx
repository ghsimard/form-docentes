import React, { useState, useEffect, useRef } from 'react';
import ThankYouPage from './components/ThankYouPage';
import HighlightedText from './components/HighlightedText';
import { frequencyQuestions7, frequencyQuestions8, frequencyQuestions9, frequencyOptions } from './data/questions';
import { FrequencyRatings } from './types/form';

interface FormData {
  schoolName: string;
  yearsOfExperience: string;
  teachingGradesEarly: string[];
  teachingGradesLate: string[];
  schedule: string;
  feedbackSources: string[];
  Comunicacion: FrequencyRatings;
  Practicas_Pedagogicas: FrequencyRatings;
  Convivencia: FrequencyRatings;
  [key: string]: string | string[] | FrequencyRatings;
}

type FrequencySection = 'Comunicacion' | 'Practicas_Pedagogicas' | 'Convivencia';

function App() {
  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    yearsOfExperience: '',
    teachingGradesEarly: [],
    teachingGradesLate: [],
    schedule: '',
    feedbackSources: [],
    Comunicacion: {},
    Practicas_Pedagogicas: {},
    Convivencia: {},
  });

  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Reset suggestions when component mounts or when input is empty
  useEffect(() => {
    if (!formData.schoolName) {
      setSchoolSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.schoolName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, section: 'teachingGradesEarly' | 'teachingGradesLate' | 'feedbackSources') => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: checked 
        ? [...prev[section], value]
        : prev[section].filter(item => item !== value)
    }));
  };

  const handleFrequencyChange = (section: FrequencySection, question: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [question]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    // Validate all required fields
    if (!formData.schoolName.trim()) {
      alert('Por favor, ingrese el nombre de la Institución Educativa.');
      return;
    }

    if (!formData.yearsOfExperience) {
      alert('Por favor, seleccione sus años de experiencia.');
      return;
    }

    if (formData.teachingGradesEarly.length === 0 && formData.teachingGradesLate.length === 0) {
      alert('Por favor, seleccione al menos un grado en el que tiene asignación de actividades de docencia.');
      return;
    }

    if (!formData.schedule) {
      alert('Por favor, seleccione su jornada de trabajo.');
      return;
    }

    if (formData.feedbackSources.length === 0) {
      alert('Por favor, seleccione al menos una fuente de retroalimentación.');
      return;
    }
    
    // Check if all frequency rating questions are answered
    const validateFrequencySection = (questions: string[], section: FrequencySection) => {
      return questions.every(question => 
        formData[section][question] !== undefined
      );
    };

    const comunicacionComplete = validateFrequencySection(frequencyQuestions7, 'Comunicacion');
    const practicasComplete = validateFrequencySection(frequencyQuestions8, 'Practicas_Pedagogicas');
    const convivenciaComplete = validateFrequencySection(frequencyQuestions9, 'Convivencia');

    if (!comunicacionComplete || !practicasComplete || !convivenciaComplete) {
      alert('Por favor, responda todas las preguntas de frecuencia antes de enviar el formulario.');
      return;
    }
    
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const result = await response.json();
      if (result.success) {
        setIsSubmitted(true);
        // Reset form data
        setFormData({
          schoolName: '',
          yearsOfExperience: '',
          teachingGradesEarly: [],
          teachingGradesLate: [],
          schedule: '',
          feedbackSources: [],
          Comunicacion: {},
          Practicas_Pedagogicas: {},
          Convivencia: {},
        });
      } else {
        throw new Error(result.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error al enviar el formulario. Por favor, intente nuevamente.');
    }
  };

  const handleSchoolNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, schoolName: value }));
    
    // Always reset suggestions when input changes
    setSchoolSuggestions([]);
    setShowSuggestions(false);

    // Only fetch new suggestions if we have 2 or more characters
    if (value.length >= 2) {
      try {
        const response = await fetch(`/api/search-schools?q=${encodeURIComponent(value)}`);
        if (response.ok) {
          const suggestions = await response.json();
          if (suggestions.length > 0) {
            setSchoolSuggestions(suggestions);
            setShowSuggestions(true);
          }
        }
      } catch (error) {
        console.error('Error fetching school suggestions:', error);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, schoolName: suggestion }));
    setShowSuggestions(false);
    setSchoolSuggestions([]);
  };

  const FrequencyMatrix = ({ 
    questionNumber, 
    questions, 
    title, 
    section 
  }: { 
    questionNumber: number; 
    questions: string[]; 
    title: string; 
    section: FrequencySection 
  }) => (
    <div className="space-y-8 mt-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {questionNumber}. {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Seleccione con qué frecuencia ocurren las siguientes situaciones
        </p>
        <p className="mt-1 text-sm text-red-500">
          * Todas las preguntas son obligatorias
        </p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="w-1/3 py-3 text-left text-sm font-medium text-gray-500"></th>
              {frequencyOptions.map((option) => (
                <th key={option} className="px-3 py-3 text-center text-sm font-medium text-gray-500">
                  {option}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.map((question, qIndex) => {
              const isAnswered = formData[section][question] !== undefined;
              const showError = hasAttemptedSubmit && !isAnswered;
              return (
                <tr key={qIndex} className={qIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className={`py-4 text-sm align-top ${showError ? 'text-red-600' : 'text-gray-900'}`}>
                    {question}
                    {showError && <span className="text-red-600 ml-1">*</span>}
                  </td>
                  {frequencyOptions.map((option) => (
                    <td key={option} className="px-3 py-4 text-center">
                      <input
                        type="radio"
                        name={`frequency-${questionNumber}-${qIndex}`}
                        value={option}
                        checked={formData[section][question] === option}
                        onChange={() => handleFrequencyChange(section, question, option)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isSubmitted) {
    return <ThankYouPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center mb-8">
            {/* Logos */}
            <div className="flex justify-between items-center mb-6">
              <img
                src="/rectores.jpeg"
                alt="Rectores Líderes Transformadores"
                className="h-28 w-auto object-contain"
              />
              <img
                src="/coordinadores.jpeg"
                alt="Coordinadores Líderes Transformadores"
                className="h-28 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              ENCUESTA DE AMBIENTE ESCOLAR
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mt-2">
              CUESTIONARIO PARA DOCENTES
            </h2>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <p className="text-sm text-blue-700">
              Con el propósito de brindar insumos valiosos a los directivos docentes sobre su Institución Educativa y apoyar la identificación de retos y oportunidades de mejora, el Programa Rectores Líderes Transformadores y Coordinadores Líderes Transformadores ha diseñado la "Encuesta de Ambiente Escolar", centrada en tres aspectos clave: la comunicación, la convivencia y las prácticas pedagógicas.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Las respuestas de los participantes son fundamentales para generar información que permita a rectores y coordinadores fortalecer su gestión institucional y avanzar en procesos de transformación, sustentados en la toma de decisiones basada en datos.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              La información recolectada será tratada de manera confidencial y utilizada exclusivamente con fines estadísticos y de mejoramiento continuo.
            </p>
            <p className="text-sm font-semibold text-blue-700 mt-2">
              Te invitamos a responder con sinceridad y a completar todas las preguntas de la encuesta. ¡Gracias!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* School Name with Autocomplete */}
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
                1. Por favor escriba el nombre de la Institución Educativa <span className="text-red-600">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  id="schoolName"
                  name="schoolName"
                  required
                  value={formData.schoolName}
                  onChange={handleSchoolNameChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Empiece a escribir para ver sugerencias..."
                />
                {showSuggestions && 
                 schoolSuggestions.length > 0 && 
                 formData.schoolName.length >= 2 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
                  >
                    {schoolSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="cursor-pointer hover:bg-blue-50 px-4 py-2"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <HighlightedText
                          text={suggestion}
                          highlight={formData.schoolName}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                2. Incluyendo este año escolar, ¿cuántos años se ha desempeñado como docente en este colegio? <span className="text-red-600">*</span>
              </label>
              <div className="mt-4 space-y-4">
                {['Menos de 1', '1', '2', '3', '4', '5', 'Más de 5'].map((year) => (
                  <div key={year} className="flex items-center">
                    <input
                      type="radio"
                      id={`year-${year}`}
                      name="yearsOfExperience"
                      value={year}
                      required
                      checked={formData.yearsOfExperience === year}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`year-${year}`} className="ml-3 block text-sm text-gray-700">
                      {year}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Teaching Grades Combined */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                3. ¿En qué grados tiene asignación de actividades de docencia en este colegio? (múltiple respuesta) <span className="text-red-600">*</span>
              </label>
              <div className="mt-4 space-y-4">
                {[
                  'Primera infancia', 'Preescolar', 
                  '1°', '2°', '3°', '4°', '5°',
                  '6°', '7°', '8°', '9°', '10°', '11°', '12°'
                ].map((grade) => (
                  <div key={grade} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`grade-${grade}`}
                      value={grade}
                      checked={formData.teachingGradesEarly.includes(grade) || formData.teachingGradesLate.includes(grade)}
                      onChange={(e) => {
                        const isEarlyGrade = ['Primera infancia', 'Preescolar', '1°', '2°', '3°', '4°', '5°'].includes(grade);
                        handleCheckboxChange(e, isEarlyGrade ? 'teachingGradesEarly' : 'teachingGradesLate');
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`grade-${grade}`} className="ml-3 block text-sm text-gray-700">
                      {grade}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule - now question 4 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                4. ¿En qué jornada desarrolla sus clases? <span className="text-red-600">*</span>
              </label>
              <div className="mt-4 space-y-4">
                {['Mañana', 'Tarde', 'Noche', 'Única'].map((schedule) => (
                  <div key={schedule} className="flex items-center">
                    <input
                      type="radio"
                      id={`schedule-${schedule}`}
                      name="schedule"
                      value={schedule}
                      required
                      checked={formData.schedule === schedule}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`schedule-${schedule}`} className="ml-3 block text-sm text-gray-700">
                      {schedule}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Sources - now question 5 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                5. ¿De quién recibe usted retroalimentación sobre su desempeño como docente? (múltiple respuesta) <span className="text-red-600">*</span>
              </label>
              <div className="mt-4 space-y-4">
                {['Rector/a', 'Coordinador/a', 'Otros/as docentes', 'Acudientes', 'Estudiantes', 'Otros', 'Ninguno'].map((source) => (
                  <div key={source} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`feedback-${source}`}
                      value={source}
                      checked={formData.feedbackSources.includes(source)}
                      onChange={(e) => handleCheckboxChange(e, 'feedbackSources')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`feedback-${source}`} className="ml-3 block text-sm text-gray-700">
                      {source}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequency Matrices - now starting from question 6 */}
            <FrequencyMatrix 
              questionNumber={6} 
              questions={frequencyQuestions7} 
              title="COMUNICACIÓN"
              section="Comunicacion"
            />
            <FrequencyMatrix 
              questionNumber={7} 
              questions={frequencyQuestions8} 
              title="PRÁCTICAS PEDAGÓGICAS"
              section="Practicas_Pedagogicas"
            />
            <FrequencyMatrix 
              questionNumber={8} 
              questions={frequencyQuestions9} 
              title="CONVIVENCIA"
              section="Convivencia"
            />

            {/* Submit Button */}
            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
