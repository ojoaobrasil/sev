import { useEffect } from 'react';
import { useSettingsStore } from '@/store/dataStore';

export function useTheme() {
  const { settings, updateSettings } = useSettingsStore();
  
  // Função para alternar entre os temas claro e escuro
  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };
  
  // Aplicar o tema ao elemento HTML
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
    
    // Forçar a atualização das variáveis CSS
    const computedStyle = getComputedStyle(document.documentElement);
    document.body.style.backgroundColor = computedStyle.getPropertyValue('--bg-color');
    document.body.style.color = computedStyle.getPropertyValue('--text-color');
    
    console.log("Tema alterado para:", settings.theme);
  }, [settings.theme]);
  
  return {
    theme: settings.theme,
    toggleTheme,
    isDark: settings.theme === 'dark',
  };
}