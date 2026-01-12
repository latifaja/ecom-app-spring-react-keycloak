import React, { useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';
import ProductList from './components/ProductList';
import './styles/App.css';

function App() {
    const [keycloak, setKeycloak] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionTime, setSessionTime] = useState(null);

    useEffect(() => {
        console.log('App: Initialisation de Keycloak...');

        const keycloakInstance = new Keycloak({
            url: 'http://localhost:8080',
            realm: 'devsecops-realm',
            clientId: 'ecom-frontend'
        });

        const initKeycloak = async () => {
            try {
                console.log('App: Vérification des tokens stockés...');

                // Récupérer les tokens stockés
                const storedToken = localStorage.getItem('kc_token');
                const storedRefreshToken = localStorage.getItem('kc_refreshToken');

                let auth = false;

                if (storedToken && storedRefreshToken) {
                    console.log('App: Tokens trouvés en localStorage, tentative de réutilisation...');

                    // Configurer l'instance avec les tokens stockés
                    keycloakInstance.token = storedToken;
                    keycloakInstance.refreshToken = storedRefreshToken;

                    // Essayer d'initialiser avec les tokens existants
                    auth = await keycloakInstance.init({
                        onLoad: 'check-sso',
                        checkLoginIframe: false,
                        token: storedToken,
                        refreshToken: storedRefreshToken,
                        pkceMethod: 'S256'
                    });

                    if (auth) {
                        console.log('App: Authentification réussie avec tokens stockés');
                    } else {
                        console.log('App: Tokens invalides ou expirés');
                    }
                }

                // Si l'authentification avec tokens stockés a échoué
                if (!auth) {
                    console.log('App: Nouvelle authentification requise');

                    // Nettoyer les anciens tokens
                    localStorage.removeItem('kc_token');
                    localStorage.removeItem('kc_refreshToken');

                    // Forcer une nouvelle authentification
                    auth = await keycloakInstance.init({
                        onLoad: 'login-required',
                        checkLoginIframe: false,
                        pkceMethod: 'S256',
                        enableLogging: true
                    });
                }

                console.log('App: Résultat d\'authentification:', auth);

                if (auth) {
                    // Stocker les nouveaux tokens
                    if (keycloakInstance.token && keycloakInstance.refreshToken) {
                        localStorage.setItem('kc_token', keycloakInstance.token);
                        localStorage.setItem('kc_refreshToken', keycloakInstance.refreshToken);
                        console.log('App: Tokens stockés dans localStorage');
                    }

                    setKeycloak(keycloakInstance);
                    setAuthenticated(true);

                    // Calculer le temps restant de session
                    if (keycloakInstance.tokenParsed?.exp) {
                        const expiresIn = Math.floor((keycloakInstance.tokenParsed.exp * 1000 - Date.now()) / 1000);
                        setSessionTime(expiresIn);
                        console.log(`App: Session expire dans ${expiresIn} secondes`);
                    }
                } else {
                    setError('Échec de l\'authentification');
                }
            } catch (err) {
                console.error('App: Erreur Keycloak:', err);
                setError(`Erreur d'authentification: ${err.message}`);

                // Nettoyer en cas d'erreur
                localStorage.removeItem('kc_token');
                localStorage.removeItem('kc_refreshToken');

                // Rediriger vers la page de login après un délai
                setTimeout(() => {
                    if (keycloakInstance) {
                        keycloakInstance.login();
                    }
                }, 2000);
            } finally {
                setLoading(false);
            }
        };

        initKeycloak();

        // Nettoyage
        return () => {
            console.log('App: Nettoyage du composant...');
        };
    }, []);

    // Rafraîchir le token périodiquement
    useEffect(() => {
        if (!keycloak || !authenticated) return;

        const refreshToken = async () => {
            try {
                const refreshed = await keycloak.updateToken(70); // 70 secondes avant expiration
                if (refreshed) {
                    console.log('App: Token rafraîchi avec succès');

                    // Mettre à jour le localStorage
                    localStorage.setItem('kc_token', keycloak.token);
                    localStorage.setItem('kc_refreshToken', keycloak.refreshToken);

                    // Mettre à jour le temps de session
                    if (keycloak.tokenParsed?.exp) {
                        const expiresIn = Math.floor((keycloak.tokenParsed.exp * 1000 - Date.now()) / 1000);
                        setSessionTime(expiresIn);
                    }
                }
            } catch (error) {
                console.error('App: Erreur lors du rafraîchissement:', error);

                // En cas d'erreur de rafraîchissement, déconnecter
                handleLogout();
            }
        };

        // Rafraîchir toutes les minutes
        const interval = setInterval(refreshToken, 60000);

        // Vérifier aussi la session toutes les 10 secondes
        const sessionCheck = setInterval(() => {
            if (keycloak.tokenParsed?.exp) {
                const expiresIn = Math.floor((keycloak.tokenParsed.exp * 1000 - Date.now()) / 1000);
                setSessionTime(expiresIn);

                if (expiresIn < 60) { // Moins d'une minute
                    console.log('App: Session sur le point d\'expirer');
                }
            }
        }, 10000);

        return () => {
            clearInterval(interval);
            clearInterval(sessionCheck);
        };
    }, [keycloak, authenticated]);

    const handleLogin = () => {
        if (keycloak) {
            keycloak.login();
        } else {
            // Si keycloak n'est pas initialisé, recharger la page
            window.location.reload();
        }
    };

    const handleLogout = () => {
        console.log('App: Déconnexion demandée');

        // Nettoyer le localStorage
        localStorage.removeItem('kc_token');
        localStorage.removeItem('kc_refreshToken');

        if (keycloak) {
            keycloak.logout();
        } else {
            // Si keycloak n'est pas disponible, recharger la page
            window.location.reload();
        }
    };

    const handleSilentLogin = async () => {
        if (keycloak) {
            try {
                const refreshed = await keycloak.updateToken(-1); // Force le rafraîchissement
                if (refreshed) {
                    console.log('App: Connexion silencieuse réussie');

                    // Mettre à jour le localStorage
                    localStorage.setItem('kc_token', keycloak.token);
                    localStorage.setItem('kc_refreshToken', keycloak.refreshToken);

                    window.location.reload();
                }
            } catch (error) {
                console.error('App: Échec de la connexion silencieuse:', error);
                handleLogout();
            }
        }
    };

    // Obtenir le nom d'utilisateur
    const getUsername = () => {
        if (!keycloak || !keycloak.tokenParsed) return 'Utilisateur';
        return keycloak.tokenParsed.preferred_username ||
            keycloak.tokenParsed.name ||
            keycloak.tokenParsed.email ||
            'Utilisateur';
    };

    // Obtenir les rôles
    const getUserRoles = () => {
        if (!keycloak || !keycloak.tokenParsed?.realm_access?.roles) return [];
        return keycloak.tokenParsed.realm_access.roles;
    };

    // Vérifier si l'utilisateur a un rôle spécifique
    const hasRole = (role) => {
        const roles = getUserRoles();
        return roles.includes(role);
    };

    // Formater le temps de session
    const formatSessionTime = (seconds) => {
        if (!seconds || seconds < 0) return 'Expirée';

        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;

        if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        }
        return `${secs}s`;
    };

    if (loading) {
        return (
            <div className="loading-fullscreen">
                <div className="spinner"></div>
                <p>Vérification de votre session...</p>
                <p className="debug-info">
                    {localStorage.getItem('kc_token') ?
                        'Tentative de réutilisation de votre session existante' :
                        'Redirection vers la page de connexion'}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-fullscreen">
                <div className="error-icon">❌</div>
                <h2>Erreur d'authentification</h2>
                <p>{error}</p>
                <div className="error-actions">
                    <button className="btn btn-primary" onClick={handleLogin}>
                        Se connecter
                    </button>
                    <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="App">
            {/* En-tête */}
            <header className="app-header">
                <div className="header-left">
                    <h1>🛒 E-Commerce Sécurisé</h1>
                    <p className="app-subtitle">Session persistante avec Keycloak</p>
                </div>

                {authenticated && keycloak ? (
                    <div className="header-right">
                        <div className="user-profile">
                            <div className="user-avatar">
                                {getUsername().charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                                <span className="user-name">👤 {getUsername()}</span>
                                <div className="user-roles">
                                    {hasRole('ADMIN') && (
                                        <span className="role-badge admin" title="Administrateur">
                                            👑 ADMIN
                                        </span>
                                    )}
                                    {hasRole('CLIENT') && (
                                        <span className="role-badge client" title="Client">
                                            🛒 CLIENT
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="session-info">
                            <div className="session-timer">
                                <span className="timer-icon">⏱️</span>
                                <span className="timer-text">
                                    {sessionTime !== null ? formatSessionTime(sessionTime) : '...'}
                                </span>
                            </div>

                            <div className="header-actions">
                                <button
                                    className="btn btn-refresh-session"
                                    onClick={handleSilentLogin}
                                    title="Rafraîchir la session"
                                >
                                    🔄
                                </button>
                                <button
                                    className="btn btn-logout"
                                    onClick={handleLogout}
                                    title="Se déconnecter"
                                >
                                    🚪 Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button className="btn btn-login" onClick={handleLogin}>
                        🔐 Connexion
                    </button>
                )}
            </header>

            {/* Contenu principal */}
            <main className="main-content">
                {authenticated && keycloak ? (
                    <div className="content-wrapper">
                        <div className="welcome-section">
                            <h2>🎉 Bienvenue, {getUsername()} !</h2>
                            <p>Votre session est active. Voici le catalogue des produits :</p>
                            <div className="session-status">
                                <span className="status-indicator active"></span>
                                <span>Session active • Rafraîchissement automatique activé</span>
                            </div>
                        </div>

                        <ProductList keycloak={keycloak} />

                        <div className="session-manager">
                            <h3>📋 Gestion de session</h3>
                            <div className="manager-actions">
                                <button className="btn btn-sm" onClick={handleSilentLogin}>
                                    🔄 Rafraîchir la session
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={handleLogout}>
                                    🚪 Fermer toutes les sessions
                                </button>
                            </div>
                            <p className="session-note">
                                <small>
                                    Votre session est sauvegardée localement.
                                    Vous resterez connecté même après avoir fermé le navigateur.
                                </small>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="login-prompt">
                        <div className="prompt-card">
                            <h2>🔒 Authentification requise</h2>
                            <p>Pour accéder à l'application, veuillez vous connecter.</p>

                            <button className="btn btn-login-large" onClick={handleLogin}>
                                🔐 Se connecter avec Keycloak
                            </button>

                            <div className="login-info">
                                <h4>Informations de connexion :</h4>
                                <ul>
                                    <li>✅ Session persistante entre les visites</li>
                                    <li>✅ Reconnexion automatique si possible</li>
                                    <li>✅ Rafraîchissement automatique du token</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Pied de page */}
            <footer className="app-footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <p>
                            <strong>État :</strong>
                            {authenticated ?
                                <span className="status-text active"> ● Session active</span> :
                                <span className="status-text inactive"> ● Non connecté</span>
                            }
                        </p>
                        <p className="footer-note">
                            Application React avec persistance de session Keycloak
                        </p>
                    </div>

                    <div className="footer-right">
                        <div className="storage-info">
                            <span className="storage-icon">💾</span>
                            <span>Session stockée localement</span>
                        </div>
                        <p className="tech-stack">
                            React • Keycloak • Spring Boot • Microservices
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;