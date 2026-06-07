import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card = ({ title, subtitle, image, children, footer, className = '', style }: CardProps) => {
  return (
    <div className={`card shadow-sm h-100 ${className}`} style={style}>
      {image && <img src={image} className="card-img-top" alt={title || 'Card image'} />}
      <div className="card-body d-flex flex-column">
        {title && <h5 className="card-title">{title}</h5>}
        {subtitle && <h6 className="card-subtitle mb-2 text-muted">{subtitle}</h6>}
        <div className="card-text flex-grow-1">{children}</div>
      </div>
      {footer && <div className="card-footer bg-transparent border-top-0">{footer}</div>}
    </div>
  );
};
