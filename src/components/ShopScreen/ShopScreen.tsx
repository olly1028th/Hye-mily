import { useGameContext } from '../../context/GameContext';
import './ShopScreen.css';

interface ShopItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  featured?: boolean;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'scarf', name: '손뜨개 목도리', icon: 'styler', price: 450, featured: true },
  { id: 'hat', name: '작은 모자', icon: 'school', price: 100 },
  { id: 'cookie', name: '버터 쿠키', icon: 'cookie', price: 50 },
  { id: 'pillow', name: '솜사탕 쿠션', icon: 'king_bed', price: 150 },
  { id: 'candy', name: '별사탕', icon: 'star', price: 20 },
];

const NEW_ARRIVALS = [
  { id: 'paint', name: '물감', icon: 'brush', price: 80 },
  { id: 'ball', name: '공', icon: 'toys', price: 40 },
  { id: 'bed', name: '침대', icon: 'bedroom_baby', price: 300 },
];

export default function ShopScreen() {
  const { state } = useGameContext();
  const pet = state.pet;
  if (!pet) return null;

  const coins = pet.totalExp;
  const featured = SHOP_ITEMS.find((item) => item.featured);
  const gridItems = SHOP_ITEMS.filter((item) => !item.featured);

  return (
    <div className="shop-screen">
      {/* Header */}
      <div className="shop-header">
        <h2 className="shop-title">Marshmallow Shop</h2>
        <div className="shop-coins">
          <span className="material-symbols-outlined shop-coin-icon" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
          <span className="shop-coin-value">{coins.toLocaleString()}</span>
        </div>
      </div>
      <p className="shop-subtitle">Today&apos;s Puffy Deals</p>

      {/* Featured */}
      {featured && (
        <div className="shop-featured">
          <div className="shop-featured-image">
            <div className="shop-featured-glow" />
            <span className="material-symbols-outlined shop-featured-icon">{featured.icon}</span>
            <div className="shop-featured-badge">Limited</div>
          </div>
          <div className="shop-featured-info">
            <div>
              <h3 className="shop-featured-name">{featured.name}</h3>
              <div className="shop-price">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>stars</span>
                <span>{featured.price}</span>
              </div>
            </div>
            <button className="shop-buy-btn">Buy</button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="shop-grid">
        {gridItems.map((item) => (
          <div key={item.id} className="shop-grid-item">
            <div className="shop-item-icon-box">
              <span className="material-symbols-outlined shop-item-icon">{item.icon}</span>
            </div>
            <div className="shop-item-meta">
              <p className="shop-item-name">{item.name}</p>
              <div className="shop-price shop-price-sm">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '12px' }}>stars</span>
                <span>{item.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Arrivals */}
      <div className="shop-section-header">
        <h4>New Arrivals</h4>
        <button className="shop-see-all">See All</button>
      </div>
      <div className="shop-arrivals no-scrollbar">
        {NEW_ARRIVALS.map((item) => (
          <div key={item.id} className="shop-arrival-card">
            <div className="shop-arrival-icon-circle">
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '28px' }}>{item.icon}</span>
            </div>
            <p className="shop-arrival-name">{item.name}</p>
            <p className="shop-arrival-price">{item.price} stars</p>
          </div>
        ))}
      </div>
    </div>
  );
}
