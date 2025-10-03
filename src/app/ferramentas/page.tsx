import Link from 'next/link';

export default function FerramentasPage() {
  const ferramentas = [
    {
      title: 'Análise de Concorrência',
      description: 'Compare preços e condições dos principais players do mercado telecom',
      href: '/ferramentas/analise-concorrencia',
      icon: '📊',
      color: 'bg-blue-500'
    },
    // Adicione mais ferramentas aqui conforme necessário
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Ferramentas
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Conjunto de ferramentas e utilitários para análise e gestão
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ferramentas.map((ferramenta, index) => (
          <Link
            key={index}
            href={ferramenta.href}
            className="group block bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${ferramenta.color} rounded-lg mb-4 text-white text-2xl`}>
                {ferramenta.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {ferramenta.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {ferramenta.description}
              </p>
              <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                Acessar ferramenta
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}