function EmailStatus({ logs }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  const getTypeLabel = (type) => {
    const types = {
      confirm: '✅ Confirmação',
      gift: '🎁 Presente',
      invite: '📨 Convite'
    };
    return types[type] || type;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📧 Últimos E-mails Enviados</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Assunto</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Enviado em</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={log.id || idx} className="border-b border-gray-200">
                <td className="px-4 py-3 text-sm">{getTypeLabel(log.type)}</td>
                <td className="px-4 py-3 text-sm">{log.subject}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(log.sentAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="text-center text-gray-500 py-8">Nenhum e-mail enviado ainda.</p>
        )}
      </div>
    </div>
  );
}

export default EmailStatus;
