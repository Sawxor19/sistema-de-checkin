import { useEffect, useState } from 'react';
import ReceptionPage from './ReceptionPage';
import TotemPage from './TotemPage';

function telaAtual(): 'totem' | 'fila' {
  return window.location.hash === '#fila' ? 'fila' : 'totem';
}

export default function App() {
  const [tela, setTela] = useState(telaAtual);
  useEffect(() => {
    const atualizar = () => setTela(telaAtual());
    window.addEventListener('hashchange', atualizar);
    return () => window.removeEventListener('hashchange', atualizar);
  }, []);
  return tela === 'fila' ? <ReceptionPage /> : <TotemPage />;
}
