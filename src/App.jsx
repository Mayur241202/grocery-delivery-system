import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Truck, Search, Bell, LogOut, Plus, Edit, Trash2, CheckCircle, XCircle, BarChart } from 'lucide-react';
import './index.css';

const GroceryDeliverySystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([
    { id: 1, name: 'Fresh Tomatoes', category: 'Vegetables', brand: 'FarmFresh', price: 40, stock: 50, image: '🍅', expiry: '2025-11-25' },
    { id: 2, name: 'Milk 1L', category: 'Dairy', brand: 'Amul', price: 60, stock: 30, image: '🥛', expiry: '2025-11-22' },
    { id: 3, name: 'Rice 5kg', category: 'Grains', brand: 'India Gate', price: 350, stock: 20, image: '🍚', expiry: '2026-06-30' },
    { id: 4, name: 'Cooking Oil 1L', category: 'Oil', brand: 'Fortune', price: 180, stock: 25, image: '🫗', expiry: '2026-03-15' },
    { id: 5, name: 'Bread', category: 'Bakery', brand: 'Britannia', price: 35, stock: 40, image: '🍞', expiry: '2025-11-20' },
    { id: 6, name: 'Eggs 12pcs', category: 'Dairy', brand: 'Keggs', price: 84, stock: 60, image: '🥚', expiry: '2025-11-28' },
  ]);
  
  const [orders, setOrders] = useState([
    { id: 1, customerId: 2, items: [{ id: 1, name: 'Fresh Tomatoes', qty: 2, price: 40 }], total: 80, status: 'pending', date: '2025-11-18', address: 'Pune, Maharashtra' },
    { id: 2, customerId: 2, items: [{ id: 2, name: 'Milk 1L', qty: 1, price: 60 }], total: 60, status: 'delivered', date: '2025-11-17', address: 'Pune, Maharashtra' },
  ]);

  const [users] = useState([
    { id: 1, email: 'admin@grocery.com', password: 'admin123', role: 'admin', name: 'Store Admin' },
    { id: 2, email: 'customer@test.com', password: 'customer123', role: 'customer', name: 'Vaibhav Jadhav', address: 'Pune, Maharashtra' },
    { id: 3, email: 'delivery@test.com', password: 'delivery123', role: 'delivery', name: 'Delivery Person' },
  ]);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', brand: '', price: '', stock: '', image: '', expiry: '' });

  const checkLowStock = () => {
    const lowStockItems = products.filter(p => p.stock < 10);
    if (lowStockItems.length > 0) {
      const notif = `Low stock alert: ${lowStockItems.map(p => p.name).join(', ')}`;
      if (!notifications.includes(notif)) {
        setNotifications(prev => [...prev, notif]);
      }
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      checkLowStock();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, currentUser]);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setCurrentView(user.role === 'customer' ? 'products' : user.role === 'admin' ? 'inventory' : 'deliveries');
      setLoginForm({ email: '', password: '' });
    } else {
      alert('Invalid credentials. Please check email and password.');
    }
  };

  const quickLogin = (role) => {
    const credentials = {
      customer: { email: 'customer@test.com', password: 'customer123' },
      admin: { email: 'admin@grocery.com', password: 'admin123' },
      delivery: { email: 'delivery@test.com', password: 'delivery123' }
    };
    setLoginForm(credentials[role]);
    const user = users.find(u => u.email === credentials[role].email);
    setCurrentUser(user);
    setCurrentView(role === 'customer' ? 'products' : role === 'admin' ? 'inventory' : 'deliveries');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setCart([]);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    alert(`${product.name} added to cart!`);
  };

  const updateCartQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const newOrder = {
      id: orders.length + 1,
      customerId: currentUser.id,
      items: cart.map(item => ({ id: item.id, name: item.name, qty: item.qty, price: item.price })),
      total,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      address: currentUser.address
    };
    
    setOrders([...orders, newOrder]);
    setProducts(products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
    }));
    setCart([]);
    alert('Order placed successfully! Order ID: ' + newOrder.id);
    setCurrentView('orders');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    alert(`Order #${orderId} status updated to ${newStatus}`);
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert('Please fill all required fields');
      return;
    }
    const product = {
      id: products.length + 1,
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock)
    };
    setProducts([...products, product]);
    setNewProduct({ name: '', category: '', brand: '', price: '', stock: '', image: '', expiry: '' });
    alert('Product added successfully!');
  };

  const updateProduct = () => {
    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
    alert('Product updated successfully!');
  };

  const deleteProduct = (id) => {
    if (window.confirm('Delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Login View
  if (currentView === 'login') {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-icon">🛒</div>
          <h1 className="login-title">Grocery Delivery System</h1>
          <p className="login-subtitle">Login to continue</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
          
          <div className="quick-login">
            <p className="quick-login-title">Quick Login:</p>
            <button onClick={() => quickLogin('customer')} className="btn btn-secondary quick-login-btn">Login as Customer</button>
            <button onClick={() => quickLogin('admin')} className="btn btn-purple quick-login-btn">Login as Admin</button>
            <button onClick={() => quickLogin('delivery')} className="btn btn-orange quick-login-btn">Login as Delivery</button>
          </div>
          
          <div className="demo-credentials">
            <p><strong>Customer:</strong> customer@test.com / customer123</p>
            <p><strong>Admin:</strong> admin@grocery.com / admin123</p>
            <p><strong>Delivery:</strong> delivery@test.com / delivery123</p>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <ShoppingCart size={32} />
            <div>
              <h1 className="header-title">Grocery Delivery System</h1>
              <p className="header-subtitle">{currentUser?.name} ({currentUser?.role})</p>
            </div>
          </div>
          
          <div className="header-right">
            {notifications.length > 0 && (
              <div className="notification-bell">
                <Bell size={24} />
                <span className="notification-badge">{notifications.length}</span>
              </div>
            )}
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-content">
          {currentUser?.role === 'customer' && (
            <>
              <button onClick={() => setCurrentView('products')} className={`nav-btn ${currentView === 'products' ? 'active' : ''}`}>
                Products
              </button>
              <button onClick={() => setCurrentView('cart')} className={`nav-btn ${currentView === 'cart' ? 'active' : ''}`}>
                Cart {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
              </button>
              <button onClick={() => setCurrentView('orders')} className={`nav-btn ${currentView === 'orders' ? 'active' : ''}`}>
                My Orders
              </button>
            </>
          )}
          
          {currentUser?.role === 'admin' && (
            <>
              <button onClick={() => setCurrentView('inventory')} className={`nav-btn ${currentView === 'inventory' ? 'active' : ''}`}>
                Inventory
              </button>
              <button onClick={() => setCurrentView('allorders')} className={`nav-btn ${currentView === 'allorders' ? 'active' : ''}`}>
                Orders
              </button>
              <button onClick={() => setCurrentView('analytics')} className={`nav-btn ${currentView === 'analytics' ? 'active' : ''}`}>
                Analytics
              </button>
            </>
          )}
          
          {currentUser?.role === 'delivery' && (
            <button onClick={() => setCurrentView('deliveries')} className={`nav-btn ${currentView === 'deliveries' ? 'active' : ''}`}>
              Deliveries
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Products View (Customer) */}
        {currentView === 'products' && (
          <div>
            <div className="search-filter">
              <div className="search-container">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>

            <div className="product-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-icon">{product.image}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-brand">{product.brand}</p>
                  <span className="product-category">{product.category}</span>
                  <div className="product-info">
                    <span className="product-price">₹{product.price}</span>
                    <span className={`product-stock ${product.stock > 10 ? 'stock-good' : 'stock-low'}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="btn-add-cart"
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cart View */}
        {currentView === 'cart' && (
          <div className="cart-container">
            <h2 className="page-title">Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={80} className="empty-icon" />
                <p className="empty-text">Your cart is empty</p>
              </div>
            ) : (
              <div>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-left">
                        <div className="cart-item-icon">{item.image}</div>
                        <div>
                          <div className="cart-item-name">{item.name}</div>
                          <div className="cart-item-price">₹{item.price} each</div>
                        </div>
                      </div>
                      
                      <div className="cart-item-right">
                        <div className="qty-controls">
                          <button onClick={() => updateCartQty(item.id, -1)} className="qty-btn">−</button>
                          <span className="qty-display">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="qty-btn">+</button>
                        </div>
                        <span className="cart-item-total">₹{item.price * item.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="cart-summary">
                  <div className="cart-total">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">
                      ₹{cart.reduce((sum, item) => sum + (item.price * item.qty), 0)}
                    </span>
                  </div>
                  <button onClick={placeOrder} className="btn-place-order">
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders View (Customer) */}
        {currentView === 'orders' && currentUser?.role === 'customer' && (
          <div className="cart-container">
            <h2 className="page-title">My Orders</h2>
            
            <div className="orders-list">
              {orders.filter(o => o.customerId === currentUser.id).map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <div className="order-id">Order #{order.id}</div>
                      <div className="order-date">{order.date}</div>
                      <div className="order-address">{order.address}</div>
                    </div>
                    <span className={`order-status status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <span>{item.name} x {item.qty}</span>
                        <span>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-total-row">
                    <span className="order-total-label">Total:</span>
                    <span className="order-total-amount">₹{order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory View (Admin) */}
        {currentView === 'inventory' && (
          <div>
            <div className="add-product-form">
              <h3 className="form-title">Add New Product</h3>
              <div className="form-grid">
                <input placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="form-input" />
                <input placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="form-input" />
                <input placeholder="Brand" value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} className="form-input" />
                <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="form-input" />
                <input type="number" placeholder="Stock" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} className="form-input" />
                <input placeholder="Emoji" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} className="form-input" />
                <input type="date" placeholder="Expiry Date" value={newProduct.expiry} onChange={(e) => setNewProduct({ ...newProduct, expiry: e.target.value })} className="form-input" />
                <button onClick={addProduct} className="btn-add-product">
                  <Plus size={20} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="inventory-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-cell">
                          <span className="product-cell-icon">{product.image}</span>
                          <div>
                            <div className="product-cell-name">{product.name}</div>
                            <div className="product-cell-brand">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>₹{product.price}</td>
                      <td><span className={product.stock < 10 ? 'stock-warning' : ''}>{product.stock}</span></td>
                      <td>{product.expiry}</td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => setEditingProduct(product)} className="btn-icon btn-edit">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => deleteProduct(product.id)} className="btn-icon btn-delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editingProduct && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3 className="modal-title">Edit Product</h3>
                  <div className="modal-form">
                    <input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="form-input" />
                    <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} className="form-input" />
                    <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })} className="form-input" />
                    <div className="modal-actions">
                      <button onClick={updateProduct} className="btn-save">Save</button>
                      <button onClick={() => setEditingProduct(null)} className="btn-modal-cancel">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Orders View (Admin) */}
        {currentView === 'allorders' && (
          <div>
            <h2 className="page-title">All Orders</h2>
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <div className="order-id">Order #{order.id}</div>
                      <div className="order-date">{order.date}</div>
                      <div className="order-address">{order.address}</div>
                    </div>
                    <span className={`order-status status-${order.status}`}>{order.status}</span>
                  </div>
                  
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <span>{item.name} x {item.qty}</span>
                        <span>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-total-row">
                    <span className="order-total-label">Total:</span>
                    <span className="order-total-amount">₹{order.total}</span>
                  </div>

                  {order.status === 'pending' && (
                    <div className="order-actions">
                      <button onClick={() => updateOrderStatus(order.id, 'packed')} className="btn-packed">
                        <Package size={18} />
                        <span>Mark as Packed</span>
                      </button>
                      <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="btn-cancel">
                        <XCircle size={18} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                  
                  {order.status === 'packed' && (
                    <button onClick={() => updateOrderStatus(order.id, 'dispatched')} className="btn-dispatch">
                      <Truck size={18} />
                      <span>Mark as Dispatched</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics View (Admin) */}
        {currentView === 'analytics' && (
          <div>
            <h2 className="page-title">Analytics Dashboard</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div>
                  <p className="stat-label">Total Products</p>
                  <p className="stat-value stat-green">{products.length}</p>
                </div>
                <Package size={64} className="stat-icon" />
              </div>

              <div className="stat-card">
                <div>
                  <p className="stat-label">Total Orders</p>
                  <p className="stat-value stat-blue">{orders.length}</p>
                </div>
                <ShoppingCart size={64} className="stat-icon" />
              </div>

              <div className="stat-card">
                <div>
                  <p className="stat-label">Total Revenue</p>
                  <p className="stat-value stat-purple">₹{orders.reduce((sum, o) => sum + o.total, 0)}</p>
                </div>
                <BarChart size={64} className="stat-icon" />
              </div>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card">
                <h3 className="analytics-title">Order Status Distribution</h3>
                <div className="status-bars">
                  {['pending', 'packed', 'dispatched', 'delivered', 'cancelled'].map(status => {
                    const count = orders.filter(o => o.status === status).length;
                    const percentage = orders.length > 0 ? (count / orders.length * 100).toFixed(1) : 0;
                    return (
                      <div key={status} className="status-bar-item">
                        <div className="status-bar-header">
                          <span className="status-bar-label">{status}</span>
                          <span className="status-bar-value">{count} ({percentage}%)</span>
                        </div>
                        <div className="status-bar-bg">
                          <div className={`status-bar-fill bar-${status === 'delivered' ? 'green' : status === 'pending' ? 'yellow' : status === 'packed' ? 'blue' : status === 'dispatched' ? 'purple' : 'red'}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="analytics-card">
                <h3 className="analytics-title">Low Stock Alerts</h3>
                <div className="low-stock-items">
                  {products.filter(p => p.stock < 10).length === 0 ? (
                    <p className="no-low-stock">All products have sufficient stock</p>
                  ) : (
                    products.filter(p => p.stock < 10).map(product => (
                      <div key={product.id} className="low-stock-item">
                        <div className="low-stock-left">
                          <span className="low-stock-icon">{product.image}</span>
                          <span className="low-stock-name">{product.name}</span>
                        </div>
                        <span className="low-stock-count">{product.stock} left</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deliveries View (Delivery Personnel) */}
        {currentView === 'deliveries' && (
          <div>
            <h2 className="page-title">Delivery Tasks</h2>
            <div className="orders-list">
              {orders.filter(o => o.status === 'dispatched' || o.status === 'delivered').map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <div className="order-id">Order #{order.id}</div>
                      <div className="order-date">{order.date}</div>
                      <div className="order-address">{order.address}</div>
                    </div>
                    <span className={`order-status status-${order.status}`}>{order.status}</span>
                  </div>
                  
                  <div className="delivery-items">
                    <p className="delivery-items-title">Order Items:</p>
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span>{item.name} x {item.qty}</span>
                          <span>₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="order-total-row">
                    <span className="order-total-label">Total Amount:</span>
                    <span className="order-total-amount">₹{order.total}</span>
                  </div>

                  {order.status === 'dispatched' && (
                    <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="btn-delivered">
                      <CheckCircle size={20} />
                      <span>Mark as Delivered</span>
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <div className="delivery-complete">
                      <CheckCircle size={20} />
                      <span>Delivery Completed</span>
                    </div>
                  )}
                </div>
              ))}
              
              {orders.filter(o => o.status === 'dispatched' || o.status === 'delivered').length === 0 && (
                <div className="empty-state">
                  <Truck size={80} className="empty-icon" />
                  <p className="empty-text">No delivery tasks assigned</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Notifications Popup */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map((notif, idx) => (
            <div key={idx} className="notification">
              <Bell size={20} />
              <div className="notification-content">{notif}</div>
              <button onClick={() => setNotifications(notifications.filter((_, i) => i !== idx))} className="notification-close">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroceryDeliverySystem;