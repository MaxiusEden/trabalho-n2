import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [senhaHash, setSenhaHash] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await usuarioService.getUsuarioByEmail(email);
      if (user && user.senhaHash === senhaHash) {
        localStorage.setItem('loggedUser', JSON.stringify(user));
        window.location.href = '/dashboard';
      } else {
        setError('Credenciais inválidas.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao fazer login.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h3 className="text-center mb-4">Login</h3>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label">Senha</label>
                  <input type="password" className="form-control" value={senhaHash} onChange={(e) => setSenhaHash(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-3">Entrar</button>
                <div className="text-center">
                  <span className="text-muted">Não tem uma conta? </span>
                  <Link to="/register" className="text-decoration-none">Registre-se</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
