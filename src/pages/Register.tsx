import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';

export const Register = () => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senhaHash, setSenhaHash] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if user exists
      const existingUser = await usuarioService.getUsuarioByEmail(email);
      if (existingUser) {
        setError('E-mail já cadastrado.');
        return;
      }

      const newUser = await usuarioService.createUsuario({
        nomeCompleto,
        email,
        senhaHash, // in a real app this would be hashed
        dataCadastro: new Date().toISOString().split('T')[0],
        role: 'aluno'
      });

      // auto login
      localStorage.setItem('loggedUser', JSON.stringify(newUser));
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      setError('Erro ao registrar.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h3 className="text-center mb-4">Criar Conta</h3>
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="form-label">Nome Completo</label>
                  <input type="text" className="form-control" value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label">Senha</label>
                  <input type="password" className="form-control" value={senhaHash} onChange={e => setSenhaHash(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-3">Registrar</button>
                <div className="text-center">
                  <span className="text-muted">Já tem uma conta? </span>
                  <Link to="/login" className="text-decoration-none">Faça login</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
