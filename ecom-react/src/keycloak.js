import React, { createContext, useState, useEffect, useContext } from 'react';
import Keycloak from 'keycloak-js';

const AuthContext = createContext(null);

const keycloakConfig = {
    url: 'http://localhost:8080',
    realm: 'devsecops-realm',
    clientId: 'ecom-frontend'
};

// Créer une seule instance globale de Keycloak
let keycloakInstance = null;

export const AuthProvider = ({ children }) => {
    const [keycloak, setKeycloak] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initKeycloak = async () => {
            try {
                // Utiliser l'instance existante ou en créer une nouvelle
                if (!keycloakInstance) {
                    keycloakInstance = new Keycloak(keycloakConfig);
                }

                const auth = await keycloakInstance.init({
                    onLoad: 'check-sso',
                    checkLoginIframe: false,
                    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
                });

                setKeycloak(keycloakInstance);
                setAuthenticated(auth);
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

    const getToken = () => {
        return keycloak?.token;
    };

    return (
        <AuthContext.Provider value={{ keycloak, authenticated, loading, login, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};