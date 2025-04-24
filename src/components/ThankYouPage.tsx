import React from 'react';

const ThankYouPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Logos */}
        <div className="flex justify-center items-center gap-8 mb-8 h-24">
          <img
            src="/rectores.jpeg"
            alt="Rectores Líderes Transformadores"
            className="h-full w-auto object-contain"
          />
          <img
            src="/coordinadores.jpeg"
            alt="Coordinadores Líderes Transformadores"
            className="h-full w-auto object-contain"
          />
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Gracias por completar la encuesta!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Sus respuestas son muy valiosas para nosotros y nos ayudarán a mejorar el ambiente escolar.
          </p>
          <p className="text-md text-gray-500">
            La información proporcionada será tratada con confidencialidad y será utilizada únicamente para fines de investigación y mejora educativa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage; 