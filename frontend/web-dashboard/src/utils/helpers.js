export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getUrgencyColor = (level) => {
  switch (level) {
    case 'high': return '#e74c3c';
    case 'medium': return '#f39c12';
    case 'low': return '#27ae60';
    default: return '#95a5a6';
  }
};

export const getUrgencyLabel = (level) => {
  switch (level) {
    case 'high': return 'HIGH - Seek Immediate Care';
    case 'medium': return 'MEDIUM - Consult Within 1-2 Weeks';
    case 'low': return 'LOW - Monitor & Follow Up';
    default: return 'Unknown';
  }
};

export const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return '#27ae60';
  if (confidence >= 0.6) return '#f39c12';
  return '#e74c3c';
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};