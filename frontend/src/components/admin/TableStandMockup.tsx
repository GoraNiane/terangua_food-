import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, Heart, UtensilsCrossed } from 'lucide-react';
import { Restaurant } from '../../types';

interface TableStandMockupProps {
  restaurant: Restaurant;
  tableNumber: string;
  url: string;
}

export const TableStandMockup: React.FC<TableStandMockupProps> = ({
  restaurant,
  tableNumber,
  url,
}) => {
  const formattedTable = tableNumber
    ? (tableNumber.length === 1 ? `0${tableNumber}` : tableNumber)
    : '08';

  return (
    <div
      id="printable-stand"
      className="relative w-full max-w-xs mx-auto bg-white border border-[#0A0A0A] rounded-3xl p-8 text-center shadow-xl space-y-6 select-none"
    >
      {/* Brand Header */}
      <div className="space-y-1">
        <h3 className="font-sans font-black text-xl tracking-tight text-[#0A0A0A] uppercase">
          {restaurant.name}
        </h3>
        <p className="text-xs text-[#666666] font-serif italic leading-snug">
          "Scannez.
          <br />
          Commandez.
          <br />
          Profitez."
        </p>
      </div>

      {/* Main QR Code Plate */}
      <div className="relative p-4 rounded-2xl bg-[#FAFAFA] text-black shadow-inner inline-block mx-auto border border-[#EAEAEA]">
        <QRCodeSVG
          value={url}
          size={190}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%200%20100%20100%22><circle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22%230A0A0A%22/><text x=%2250%22 y=%2260%22 font-size=%2242%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22sans-serif%22 font-weight=%22bold%22>TF</text></svg>',
            height: 38,
            width: 38,
            excavate: true,
          }}
        />
      </div>

      {/* Table Number Identifier */}
      <div className="space-y-1">
        <div className="inline-block bg-[#0A0A0A] text-white font-extrabold text-sm px-6 py-2 rounded-full shadow-sm tracking-widest uppercase font-mono">
          Table {formattedTable}
        </div>
        <p className="text-[10px] text-[#888888] font-medium tracking-wide">
          Dakar • teranga-food.sn
        </p>
      </div>
    </div>
  );
};
