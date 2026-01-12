import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ProductList.css';

const ProductList = ({ keycloak }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const fetchProducts = useCallback(async () => {
        if (!keycloak || !keycloak.token) {
            setError('Non authentifié');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Rafraîchir le token si nécessaire
            await keycloak.updateToken(30);
            const token = keycloak.token;

            // Utiliser le proxy React
            const response = await axios.get('/product-service/products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            setProducts(response.data || []);
        } catch (err) {
            console.error('Erreur:', err);

            if (err.response?.status === 401) {
                setError('Session expirée. Redirection...');
                setTimeout(() => keycloak.logout(), 2000);
            } else if (err.response?.status === 403) {
                setError('Accès interdit. Vous n\'avez pas les permissions nécessaires.');
            } else if (err.request) {
                setError('Impossible de se connecter au serveur. Vérifiez que l\'API Gateway est démarrée.');
            } else {
                setError('Erreur lors du chargement des produits.');
            }
        } finally {
            setLoading(false);
        }
    }, [keycloak]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Fonction de tri
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Produits triés
    const sortedProducts = React.useMemo(() => {
        if (!sortConfig.key) return products;

        return [...products].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [products, sortConfig]);

    // Formater le prix
    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    // Obtenir l'indicateur de tri
    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '⬆️' : '⬇️';
    };

    if (loading) {
        return (
            <div className="loading-section">
                <div className="spinner"></div>
                <p>Chargement des produits...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-section">
                <h3>⚠️ Erreur</h3>
                <p>{error}</p>
                <button onClick={fetchProducts}>
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="product-list-container">
            <div className="table-header">
                <h2>📋 Catalogue des Produits</h2>
                <div className="table-info">
                    <span className="product-count">
                        {products.length} produit{products.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        className="refresh-btn"
                        onClick={fetchProducts}
                        title="Rafraîchir la liste"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="empty-table">
                    <p>📭 Aucun produit disponible dans la base de données</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="products-table">
                        <thead>
                        <tr>
                            <th onClick={() => handleSort('id')}>
                                ID {getSortIndicator('id')}
                            </th>
                            <th onClick={() => handleSort('name')}>
                                Nom {getSortIndicator('name')}
                            </th>
                            <th onClick={() => handleSort('description')}>
                                Description {getSortIndicator('description')}
                            </th>
                            <th onClick={() => handleSort('price')}>
                                Prix {getSortIndicator('price')}
                            </th>
                            <th onClick={() => handleSort('quantity')}>
                                Stock {getSortIndicator('quantity')}
                            </th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedProducts.map((product, index) => (
                            <tr key={product.id || index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                                <td className="product-id">
                                    <code>{product.id ? product.id.substring(0, 8) + '...' : 'N/A'}</code>
                                </td>
                                <td className="product-name">
                                    <strong>{product.name || 'Nom non défini'}</strong>
                                </td>
                                <td className="product-description">
                                    {product.description || 'Aucune description'}
                                </td>
                                <td className="product-price">
                                        <span className="price-badge">
                                            {formatPrice(product.price || 0)}
                                        </span>
                                </td>
                                <td className="product-quantity">
                                        <span className={`stock-badge ${
                                            product.quantity > 10 ? 'in-stock' :
                                                product.quantity > 0 ? 'low-stock' : 'out-of-stock'
                                        }`}>
                                            {product.quantity > 10 ? '📦 ' :
                                                product.quantity > 0 ? '⚠️ ' : '❌ '}
                                            {product.quantity || 0} unité{product.quantity !== 1 ? 's' : ''}
                                        </span>
                                </td>
                                <td className="product-actions">
                                    <button
                                        className="action-btn view-btn"
                                        title="Voir les détails"
                                    >
                                        👁️
                                    </button>
                                    {keycloak?.tokenParsed?.realm_access?.roles?.includes('ADMIN') && (
                                        <>
                                            <button
                                                className="action-btn edit-btn"
                                                title="Modifier"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                title="Supprimer"
                                            >
                                                🗑️
                                            </button>
                                        </>
                                    )}
                                    {keycloak?.tokenParsed?.realm_access?.roles?.includes('CLIENT') && product.quantity > 0 && (
                                        <button
                                            className="action-btn cart-btn"
                                            title="Ajouter au panier"
                                        >
                                            🛒
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="table-footer">
                <div className="summary">
                    <p>
                        <strong>Total:</strong> {products.length} produit{products.length !== 1 ? 's' : ''} |
                        <strong> Valeur totale:</strong> {formatPrice(products.reduce((sum, p) => sum + (p.price || 0), 0))} |
                        <strong> Stock total:</strong> {products.reduce((sum, p) => sum + (p.quantity || 0), 0)} unités
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductList;