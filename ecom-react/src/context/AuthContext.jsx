import React, { createContext, useState, useEffect, useContext } from 'react';
import Keycloak from 'keycloak-js';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [keycloak, setKeycloak] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState('');

    useEffect(() => {
        // Utiliser 'new' pour instancier Keycloak
        const keycloakInstance = new Keycloak({
            url: 'http://localhost:8080',
            realm: 'devsecops-realm',
            clientId: 'ecom-frontend'
        });

        const initKeycloak = async () => {
            try {
                const auth = await keycloakInstance.init({
                    onLoad: 'check-sso', // Utiliser 'check-sso' au lieu de 'login-required' pour test
                    checkLoginIframe: false,
                    pkceMethod: 'S256'
                });

                if (auth) {
                    setKeycloak(keycloakInstance);
                    setAuthenticated(true);
                    setToken(keycloakInstance.token);
                    console.log('Authentifié avec succès');
                } else {
                    console.log('Non authentifié');
                }
            } catch (error) {
                console.error('Erreur Keycloak:', error);
            } finally {
                setLoading(false);
            }
        };

        initKeycloak();
    }, []);

    const login = () => {
        if (keycloak) {
            keycloak.login();
        }
    };

    const logout = () => {
        if (keycloak) {
            keycloak.logout();
        }
    };

    const value = {
        keycloak,
        authenticated,
        loading,
        token,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};