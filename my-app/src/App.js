import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar.js';
import Home from './components/Home.js';
import About from './components/About.js';
import Collections from './components/Collections.js';
import Register from './components/Register.js';
import LoginPage from './components/LoginPage.js';
import ForgotPassword from './components/ForgotPassword.js';
import MainContent from './components/MainContent.js';
import Search from './components/Search.js';
import AnimeDetail from './components/AnimeDetail.js';
import CollectionDetail from './components/CollectionDetail';
import { AuthProvider } from "./contexts/AuthContext";

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <div>
          <Navbar />
          <MainContent />
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/home" element={<><Home /><About /></>} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/search" element={<Search />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:collectionId" element={<CollectionDetail />} />


          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
