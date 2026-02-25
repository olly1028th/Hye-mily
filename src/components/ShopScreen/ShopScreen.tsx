import { useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { SHOP_ITEMS as ITEMS } from '../../constants';
import type { ShopItemDef } from '../../types';
import './ShopScreen.css';

type Category = 'all' | 'snack' | 'toy' | 'care';

const CATEGORY_LABELS: Record<Category, string> = {
  all: '전체',
  snack: '간식',
  toy: '장난감',
  care: '케어',
};

export default function ShopScreen() {
  const { state, dispatch } = useGameContext();
  const pet = state.pet;
  const [selectedCat, setSelectedCat] = useState<Category>('all');
  const [purchasedId, setPurchasedId] = useState<string | null>(null);

  if (!pet) return null;

  const coins = pet.coins;
  const filtered = selectedCat === 'all'
    ? ITEMS
    : ITEMS.filter((item) => item.category === selectedCat);

  const handleBuy = (item: ShopItemDef) => {
    if (coins < item.price) return;
    dispatch({ type: 'BUY_ITEM', item });
    dispatch({ type: 'ADD_EVENT', message: `${item.name}을(를) 사용했어요! 💰 -${item.price}코인` });
    setPurchasedId(item.id);
    setTimeout(() => setPurchasedId(null), 1200);
  };

  return (
    <div className="shop-screen">
      {/* Header */}
      <div className="shop-header">
        <h2 className="shop-title">간식 상점</h2>
        <div className="shop-coins">
          <span className="material-symbols-outlined shop-coin-icon" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
          <span className="shop-coin-value">{coins.toLocaleString()}</span>
        </div>
      </div>
      <p className="shop-subtitle">미니게임으로 코인을 모아 간식을 사주세요!</p>

      {/* Category filter */}
      <div className="shop-categories">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
          <button
            key={cat}
            className={`shop-cat-btn ${selectedCat === cat ? 'active' : ''}`}
            onClick={() => setSelectedCat(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="shop-grid">
        {filtered.map((item) => {
          const canAfford = coins >= item.price;
          const justBought = purchasedId === item.id;

          return (
            <div key={item.id} className={`shop-grid-item ${justBought ? 'shop-bought' : ''}`}>
              <div className="shop-item-icon-box">
                <span className="material-symbols-outlined shop-item-icon">{item.icon}</span>
              </div>
              <div className="shop-item-meta">
                <p className="shop-item-name">{item.name}</p>
                <p className="shop-item-desc">{item.description}</p>
                <div className="shop-item-effects">
                  {Object.entries(item.effects).map(([key, val]) => (
                    <span key={key} className={`shop-effect-tag ${val > 0 ? 'positive' : 'negative'}`}>
                      {statLabel(key)} {val > 0 ? `+${val}` : val}
                    </span>
                  ))}
                </div>
                <div className="shop-item-footer">
                  <div className="shop-price shop-price-sm">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>monetization_on</span>
                    <span>{item.price}</span>
                  </div>
                  <button
                    className={`shop-buy-btn-sm ${!canAfford ? 'disabled' : ''}`}
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                  >
                    {justBought ? '✓' : canAfford ? '구매' : '부족'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function statLabel(key: string): string {
  const map: Record<string, string> = {
    hunger: '배고픔',
    happiness: '행복',
    energy: '에너지',
    cleanliness: '청결',
    health: '건강',
  };
  return map[key] ?? key;
}
