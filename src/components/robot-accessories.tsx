
'use client';

import React from 'react';

const hatComponents: Record<string, React.FC> = {
    "Top Hat": () => (
        <g transform='translate(60, 20) scale(0.9)'>
            <path d="M 0,30 C 0,25 5,25 10,20 H 70 C 75,25 80,25 80,30 V 28 H 0 Z" fill="#333"/>
            <rect x="15" y="0" width="50" height="25" fill="#333" />
            <rect x="12" y="18" width="56" height="4" fill="#555" />
        </g>
    ),
    "Propeller Hat": () => (
        <g transform='translate(100, 38)'>
            <path d='M-35 0 C-35 -15, 35 -15, 35 0' fill='#f44336' />
            <path d='M-25,0 L-25,-5 L25,-5 L25,0' fill="#3b82f6" />
            <path d='M 0 -25 L 0 -5' stroke='#333' strokeWidth='3' />
            <g style={{ transformOrigin: 'center', animation: 'spin 0.5s linear infinite' }}>
                <path d='M -20 -25 L 20 -25' stroke='yellow' strokeWidth='5' strokeLinecap='round' />
            </g>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </g>
    ),
    "Crown": () => (
        <g transform='translate(62, 25) scale(1)'>
            <path d='M0 20 L75 20 L70 -5 L55 10 L37.5 -15 L20 10 L5 -5 Z' fill='gold' stroke='#f59e0b' strokeWidth='1.5' />
            <circle cx="10" cy="15" r="3" fill="red" />
            <circle cx="37.5" cy="5" r="3" fill="blue" />
            <circle cx="65" cy="15" r="3" fill="green" />
        </g>
    ),
    "Wizard Hat": () => (
        <g transform='translate(50, 15) scale(0.95)'>
            <path d='M-10 50 L110 50 Q50 40 -10 50' fill='#2c3e50' />
            <path d='M50 -20 L20 50 Q50 40 80 50 L50 -20' fill='#2c3e50' />
            <path d='M45 20 L55 30 L65 20' stroke='yellow' strokeWidth='2' fill='none' />
            <path d='M40 35 L50 45 L60 35' stroke='yellow' strokeWidth='2' fill='none' />
        </g>
    ),
    "Beanie": () => (
        <g transform='translate(52, 30)'>
            <path d='M0 15 C0 -15, 95 -15, 95 15 Z' fill='teal' />
            <rect x="0" y="10" width="95" height="10" fill="darkcyan" />
            <circle cx="47.5" cy="-10" r="8" fill="white" />
        </g>
    ),
    "Cowboy Hat": () => (
        <g transform='translate(45, 25)'>
            <path d="M -15,25 C 20,5 90,5 125,25 L 120,25 C 85,15 25,15 -10,25 Z" fill="#A0522D" stroke="#654321" strokeWidth="2" />
            <path d="M 15,22 C 25,0 85,0 95,22 L 85,22 C 75,10 35,10 25,22 Z" fill="#8B4513" />
        </g>
    ),
    "Party Hat": () => (
        <g transform='translate(75, 15)'>
            <path d='M25 0 L0 50 L50 50 Z' fill='pink' />
            <circle cx="25" cy="20" r="4" fill="yellow" />
            <circle cx="15" cy="35" r="4" fill="cyan" />
            <circle cx="35" cy="35" r="4" fill="lime" />
            <circle cx="25" cy="3" r="5" fill="orange" />
        </g>
    ),
    "Pilgrim Hat": () => (
        <g transform="translate(60, 20) scale(0.9)">
            <path d="M0,30 C0,25 5,25 10,20 H 70 C 75,25 80,25 80,30 V 28 H 0 Z" fill="#333"/>
            <rect x="15" y="0" width="50" height="25" fill="#333" />
            <rect x="25" y="15" width="30" height="10" fill="#777" />
            <rect x="30" y="17" width="20" height="6" fill="#f0e68c" />
        </g>
    ),
    "Turkey Hat": () => (
        <g transform="translate(100, 75) scale(1.6)">
            <g>
                <path d="M -15,-20 a 15,15 0 0,1 30,0" fill="#8B4513"/>
                <path d="M -5,-35 a 10,10 0 0,1 10,0" fill="red" />
                 <path d="M-20,-15 Q0,-40 20,-15" fill="none" stroke="#A0522D" stroke-width="5" />
                 <path d="M-30,-5 Q0,-35 30,-5" fill="none" stroke="#d32f2f" stroke-width="5" />
                 <path d="M-40,10 Q0,-30 40,10" fill="none" stroke="#FFC107" stroke-width="5" />
            </g>
        </g>
    ),
    "Viking Helmet": () => (
        <g transform="translate(58, 35)">
            <path d="M0 10 C0 -10, 85 -10, 85 10" fill="#C0C0C0" stroke="#A9A9A9" strokeWidth="2" />
            <path d="M-10 5 C-20 -15, -30 -5, -10 5" fill="#F0E68C" stroke="#B8860B" strokeWidth="1.5" />
            <path d="M95 5 C 105 -15, 115 -5, 95 5" fill="#F0E68C" stroke="#B8860B" strokeWidth="1.5" />
        </g>
    ),
    "Fedora": () => (
        <g transform="translate(50, 28)">
            <path d="M-5 15 L105 15 L100 5 L0 5 Z" fill="#3D2B1F"/>
            <path d="M10 5 Q50 -10 90 5 L 80 5 Q50 -2 20 5 Z" fill="#332211"/>
            <rect x="0" y="3" width="100" height="4" fill="#111" />
        </g>
    ),
    "Chef's Hat": () => (
        <g transform="translate(65, 5)">
            <rect x="0" y="35" width="70" height="10" fill="white" stroke="#ccc" strokeWidth="1" />
            <path d="M-5 20 C-15 -10, 30 -20, 35 0 C 40 -20, 85 -10, 75 20 Z" fill="white" stroke="#ccc" strokeWidth="1" />
            <path d="M0 35 C 0 15, 70 15, 70 35" fill="white" stroke="#ccc" strokeWidth="1" />
        </g>
    ),
    "Detective Hat": () => (
        <g transform="translate(52, 25)">
            <path d="M0 20 C0 -10, 95 -10, 95 20 Z" fill="#a05a2c" />
            <path d="M-10 20 L10 20 L5 15 Z" fill="#804515" stroke="black" strokeWidth="1"/>
            <path d="M105 20 L85 20 L90 15 Z" fill="#804515" stroke="black" strokeWidth="1"/>
            <rect x="0" y="18" width="95" height="4" fill="#c77d3f"/>
        </g>
    ),
    "Headphones": () => (
        <g transform="translate(45, 52)">
            <path d="M0 0 C0 -45, 110 -45, 110 0" stroke="black" strokeWidth="8" fill="none" />
            <rect x="-15" y="-10" width="30" height="35" rx="8" fill="gray" />
            <rect x="95" y="-10" width="30" height="35" rx="8" fill="gray" />
            <circle cx="0" cy="5" r="10" fill="#333" />
            <circle cx="110" cy="5" r="10" fill="#333" />
        </g>
    ),
    "Flower Crown": () => (
        <g transform="translate(52, 35)">
            <path d="M0 0 C15 -15, 80 -15, 95 0" stroke="#22c55e" strokeWidth="4" fill="none"/>
            <circle cx="10" cy="-10" r="8" fill="#f472b6" />
            <circle cx="30" cy="-15" r="8" fill="#facc15" />
            <circle cx="50" cy="-17" r="8" fill="#60a5fa" />
            <circle cx="70" cy="-15" r="8" fill="#c084fc" />
            <circle cx="90" cy="-10" r="8" fill="#f87171" />
        </g>
    ),
    "Knight Helmet": () => (
        <g transform="translate(55, 25)">
          <path d="M0 20 C0 -10, 90 -10, 90 20 V 50 H 0 Z" fill="#C0C0C0" stroke="#A9A9A9" strokeWidth="2" />
          <path d="M45 -5 L 45 20" stroke="#A9A9A9" strokeWidth="2" />
          <rect x="15" y="30" width="60" height="5" fill="#A9A9A9" />
          <path d="M-5 15 L 95 15" stroke="#A9A9A9" strokeWidth="3" />
        </g>
    ),
    "Astronaut Helmet": () => (
        <g transform="translate(50, 20)">
            <circle cx="50" cy="40" r="50" fill="white" stroke="#ccc" strokeWidth="2"/>
            <circle cx="50" cy="40" r="35" fill="#222" />
            <circle cx="50" cy="40" r="35" fill="url(#glassReflection)" />
        </g>
    ),
    "Plague Doctor Mask": () => (
        <g transform="translate(50, 40)">
            <path d="M0 0 C0 -20, 80 -20, 80 0 V 30 H 0 Z" fill="#333"/>
            <path d="M40 0 L 100 20 L 40 30 Z" fill="#222" />
            <circle cx="20" cy="5" r="8" fill="#111" />
            <circle cx="60" cy="5" r="8" fill="#111" />
            <circle cx="20" cy="5" r="5" fill="red" opacity="0.7" />
            <circle cx="60" cy="5" r="5" fill="red" opacity="0.7" />
        </g>
    ),
};

const shirtComponents: Record<string, React.FC> = {
    "T-Shirt": () => (
        <g>
            <path d='M70 110 L130 110 L130 150 L70 150 Z' fill='rgba(255,0,0,0.7)' />
        </g>
    ),
    "Bow Tie": () => (
        <g transform="translate(0, 2)">
            <path d='M85 105 L100 95 L100 115 Z' fill='red' stroke='black' strokeWidth='1' />
            <path d='M115 105 L100 95 L100 115 Z' fill='red' stroke='black' strokeWidth='1' />
            <circle cx="100" cy="105" r="4" fill="darkred" />
        </g>
    ),
    "Hoodie": () => (
         <g>
            <path d='M70 105 L130 105 L130 155 L70 155 Z' fill='rgba(60,60,60,0.8)' />
            <path d='M85 110 L115 110 L115 125 L100 135 L85 125 Z' fill='rgba(40,40,40,0.8)' />
        </g>
    ),
    "Vest": () => (
         <g>
            <path d='M75 105 L125 105 L120 155 L80 155 Z' fill='#8B4513' />
            <path d='M80 105 L120 105 L115 150 L85 150 Z' fill='white' />
        </g>
    ),
    "Plaid Shirt": () => (
        <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#d32f2f' />
            <path d='M65 115 L135 115' stroke='black' strokeOpacity="0.5" strokeWidth='6' />
            <path d='M65 135 L135 135' stroke='black' strokeOpacity="0.5" strokeWidth='6' />
            <path d='M85 105 L85 155' stroke='black' strokeOpacity="0.5" strokeWidth='6' />
            <path d='M115 105 L115 155' stroke='black' strokeOpacity="0.5" strokeWidth='6' />
        </g>
    ),
    "Flannel": () => (
        <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#222' />
            <path d='M65 115 L135 115' stroke='#b91c1c' strokeOpacity="0.8" strokeWidth='6' />
            <path d='M65 135 L135 135' stroke='#b91c1c' strokeOpacity="0.8" strokeWidth='6' />
            <path d='M85 105 L85 155' stroke='#b91c1c' strokeOpacity="0.8" strokeWidth='6' />
            <path d='M115 105 L115 155' stroke='#b91c1c' strokeOpacity="0.8" strokeWidth='6' />
        </g>
    ),
    "Turtleneck": () => (
         <g>
            <path d='M70 105 L130 105 L130 155 L70 155 Z' fill='#D2B48C' />
            <path d='M80 95 L120 95 L120 110 L80 110 Z' fill='#D2B48C' />
        </g>
    ),
    "Ugly Thanksgiving Sweater": () => (
        <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#f59e0b' />
            {/* Turkey */}
            <path transform="translate(85, 120) scale(0.3)" d="M-25,0 a25,20 0 1,1 50,0 a25,20 0 1,1 -50,0" fill="#8B4513" />
            <rect transform="translate(85, 120) scale(0.3)" x="-15" y="-10" width="10" height="5" fill="#DEB887" transform="rotate(-30 -15 -10)" />
            <rect transform="translate(85, 120) scale(0.3)" x="5" y="-10" width="10" height="5" fill="#DEB887" transform="rotate(30 5 -10)" />
             {/* Leaf */}
            <path transform="translate(110, 135) scale(0.3) rotate(30)" d="M0-25 C20-25 20,5 0,25 C-20,5 -20-25 0-25 Z" fill="#b33b00" />
        </g>
    ),
    "Football Jersey": () => (
         <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='darkgreen' />
            <text x="100" y="140" fill="white" fontSize="40" fontWeight="bold" textAnchor="middle">67</text>
        </g>
    ),
    "Striped Shirt": () => (
        <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#fff' />
            <path d='M65 115 L135 115' stroke='#3498db' strokeWidth='8' />
            <path d='M65 135 L135 135' stroke='#3498db' strokeWidth='8' />
        </g>
    ),
    "Polka Dot Shirt": () => (
        <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#e74c3c' />
            <circle cx="80" cy="120" r="5" fill="white" />
            <circle cx="100" cy="115" r="5" fill="white" />
            <circle cx="120" cy="125" r="5" fill="white" />
            <circle cx="85" cy="140" r="5" fill="white" />
            <circle cx="115" cy="145" r="5" fill="white" />
        </g>
    ),
    "Sweater": () => (
        <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#2ecc71' />
            <path d='M80 115 L120 115' stroke='white' strokeWidth='3' />
            <path d='M80 125 L120 125' stroke='white' strokeWidth='3' />
            <path d='M80 135 L120 135' stroke='white' strokeWidth='3' />
            <path d='M80 145 L120 145' stroke='white' strokeWidth='3' />
        </g>
    ),
    "Tuxedo": () => (
        <g>
            <path d='M70 105 L130 105 L130 155 L70 155 Z' fill='black' />
            <path d='M85 105 L115 105 L100 135 Z' fill='white' />
            <circle cx="100" cy="118" r="3" fill="black" />
            <circle cx="100" cy="128" r="3" fill="black" />
             <g transform="translate(0, 2)">
                <path d='M90 105 L100 95 L100 115 Z' fill='black' stroke='black' strokeWidth='1' />
                <path d='M110 105 L100 95 L100 115 Z' fill='black' stroke='black' strokeWidth='1' />
                <circle cx="100" cy="105" r="4" fill="black" />
            </g>
        </g>
    ),
    "Lab Coat": () => (
        <g>
            <path d='M65 105 L135 105 L135 170 L65 170 Z' fill='white' stroke="gray" strokeWidth="1" />
            <path d='M100 105 L100 170' stroke='gray' strokeWidth='0.5' />
            <rect x="75" y="115" width="20" height="5" fill="lightgray" />
        </g>
    ),
    "Superhero Cape": () => (
        <g>
            <path d="M70 110 C 50 150, 150 150, 130 110 C 130 180, 70 180, 70 110" fill="red"/>
        </g>
    ),
    "Overalls": () => (
        <g>
            <path d="M70 130 L130 130 L130 160 L70 160 Z" fill="#3498db" />
            <path d="M70 110 L75 130" stroke="#3498db" strokeWidth="5"/>
            <path d="M130 110 L125 130" stroke="#3498db" strokeWidth="5"/>
            <path d="M85 130 L115 130 L115 140 L85 140 Z" fill="#2980b9" />
        </g>
    ),
    "Turkey Costume": () => (
        <g transform="translate(100, 140)">
            <g>
                <path d="M0,-25 Q30,-40 50,0 Q30,10 0,-25" fill="#A0522D"/>
                <path d="M0,-25 Q-30,-40 -50,0 Q-30,10 0,-25" fill="#A0522D"/>
                <path d="M0,-25 a 25 25 0 0 0 0 50 a 25 25 0 0 0 0 -50" fill="#8B4513"/>
                <circle cx="0" cy="0" r="25" fill="#8B4513"/>
            </g>
        </g>
    ),
    "Knight Armor": () => (
        <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#C0C0C0' />
            <path d='M65 105 L135 105 L135 115 L65 115 Z' fill='#A9A9A9' />
            <path d='M80 120 L120 120' stroke='#A9A9A9' strokeWidth='2' />
            <path d='M80 135 L120 135' stroke='#A9A9A9' strokeWidth='2' />
        </g>
    ),
    "Astronaut Suit": () => (
         <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='white' />
            <rect x="90" y="115" width="20" height="30" rx="5" fill="#A9A9A9" />
            <circle cx="80" cy="120" r="4" fill="red" />
            <circle cx="120" cy="120" r="4" fill="blue" />
        </g>
    ),
    "Royal Robe": () => (
        <g>
            <path d="M60 105 L140 105 L150 170 L50 170 Z" fill="#800080" />
            <path d="M60 105 L80 105 L80 170 L50 170 Z" fill="#F0E68C" />
            <path d="M140 105 L120 105 L120 170 L150 170 Z" fill="#F0E68C" />
            <circle cx="100" cy="125" r="8" fill="#DAA520" />
        </g>
    ),
    "Plain Tee": () => ( <path d='M70 110 L130 110 L130 150 L70 150 Z' fill='#f1f5f9' /> ),
    "V-Neck": () => ( <path d='M70 110 L130 110 L130 150 L70 150 Z M80 110 L100 125 L120 110 Z' fill='#27272a' stroke='black' stroke-width='1'/> ),
    "Pocket Tee": () => ( <g><path d='M70 110 L130 110 L130 150 L70 150 Z' fill='#64748b' /><rect x='75' y='115' width='15' height='15' fill='#475569' rx='2' /></g> ),
    "Long-Sleeve Tee": () => ( <g><path d='M70 110 L130 110 L130 150 L70 150 Z' fill='#059669' /><rect x='45' y='110' width='25' height='35' fill='#059669' /><rect x='130' y='110' width='25' height='35' fill='#059669' /></g> ),
    "Basic Tank Top": () => ( <path d='M80 105 L120 105 L125 150 L75 150 Z' fill='#e11d48'/> ),
    "Henley Shirt": () => ( <g><path d='M70 110 L130 110 L130 150 L70 150 Z' fill='#f59e0b' /><rect x='95' y='110' width='10' height='20' fill='#d97706' /><circle cx='100' cy='115' r='2' fill='white' /><circle cx='100' cy='122' r='2' fill='white' /></g> ),
    "Simple Polo": () => ( <g><path d='M70 110 L130 110 L130 150 L70 150 Z' fill='#0ea5e9'/><path d='M90 110 L85 120 L115 120 L110 110 Z' fill='#0284c7' /></g> ),
    "Ringer Tee": () => ( <g><path d='M70 110 L130 110 L130 150 L70 150 Z' fill='white' /><rect x='70' y='110' width='60' height='5' fill='#dc2626' /><path d='M65 110 L70 115' stroke='#dc2626' stroke-width='4' /><path d='M135 110 L130 115' stroke='#dc2626' stroke-width='4' /></g> ),
    "Raglan Shirt": () => ( <g><path d='M70 110 L130 110 L130 150 L70 150 Z' fill='white' /><path d='M70 110 L100 130 L130 110 Z' fill='#65a30d' /></g> ),
    "Graphic Tee": () => ( <g><path d='M70 110 L130 110 L130 150 L70 150 Z' fill='#1e293b'/><text x='100' y='135' font-size='24' fill='white' text-anchor='middle'>AI</text></g> ),
    "Hawaiian Shirt": () => ( <g><path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#2563eb' /><text x='80' y='125' font-size='12'>🌴</text><text x='110' y='145' font-size='12'>🌺</text><text x='95' y='130' font-size='12'>☀️</text></g> ),
    "Bowling Shirt": () => ( <g><path d='M70 105 L130 105 L130 155 L70 155 Z' fill='#ef4444' /><path d='M70 105 L95 105 L95 155 L70 155 Z' fill='#1f2937' /></g> ),
    "Denim Shirt": () => ( <g><path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#3b82f6' /><rect x='75' y='115' width='15' height='15' fill='#60a5fa' rx='2' /></g> ),
    "Suspender Shirt": () => ( <g><path d='M65 105 L135 105 L135 155 L65 155 Z' fill='white' /><path d='M80 105 L90 155' stroke='#713f12' stroke-width='5' /><path d='M120 105 L110 155' stroke='#713f12' stroke-width='5' /></g> ),
    "Argyle Sweater Vest": () => ( <g><path d='M75 105 L125 105 L125 155 L75 155 Z' fill='#eab308' /><path d='M100 105 L125 130 L100 155 L75 130 Z' fill='#f59e0b' /><path d='M75 130 L125 130' stroke='#dc2626' stroke-width='2' stroke-dasharray='4 4' /><path d='M100 105 L100 155' stroke='#dc2626' stroke-width='2' stroke-dasharray='4 4' /></g> ),
    "Galaxy Print Shirt": () => ( <g><path d='M65 105 L135 105 L135 155 L65 155 Z' fill='black' /><circle cx='80' cy='120' r='2' fill='white'/><circle cx='90' cy='140' r='1' fill='white'/><circle cx='105' cy='115' r='2' fill='white'/><circle cx='120' cy='130' r='1' fill='white'/><path d='M90 125 Q 100 120 110 130' stroke='purple' stroke-width='3' fill='none' opacity='0.5' /></g> ),
    "Tie-Dye Shirt": () => ( <g><circle cx='100' cy='130' r='35' fill='yellow' /><circle cx='100' cy='130' r='25' fill='orange' /><circle cx='100' cy='130' r='15' fill='red' /><path d='M65 105 L135 105 L135 155 L65 155 Z' fill='url(#tieDye)' clip-path='url(#shirt-clip)' /><defs><radialGradient id='tieDye'><stop offset='10%' stop-color='red' /><stop offset='50%' stop-color='yellow' /><stop offset='95%' stop-color='blue' /></radialGradient><clipPath id='shirt-clip'><path d='M65 105 L135 105 L135 155 L65 155 Z' /></clipPath></defs></g> ),
    "Vertical Stripes": () => ( <g><rect x="65" y="105" width="70" height="50" fill="white" /><rect x="75" y="105" width="10" height="50" fill="#3b82f6" /><rect x="95" y="105" width="10" height="50" fill="#3b82f6" /><rect x="115" y="105" width="10" height="50" fill="#3b82f6" /></g> ),
    "Checkerboard Shirt": () => ( <g><rect x="65" y="105" width="70" height="50" fill="white" /><path d='M65 105 h14 v10 h-14z M89 105 h14 v10 h-14z M113 105 h14 v10 h-14z M79 115 h14 v10 h-14z M103 115 h14 v10 h-14z M65 125 h14 v10 h-14z M89 125 h14 v10 h-14z M113 125 h14 v10 h-14z M79 135 h14 v10 h-14z M103 135 h14 v10 h-14z M65 145 h14 v10 h-14z M89 145 h14 v10 h-14z M113 145 h14 v10 h-14z' fill='black' /></g> ),
    "Leather Jacket": () => ( <g><path d='M70 105 L130 105 L130 155 L70 155 Z' fill='#444' /><path d='M80 105 L95 155' stroke='black' stroke-width='3' /><path d='M120 105 L105 155' stroke='black' stroke-width='3'/></g> ),
    "Blazer": () => ( <g><path d='M70 105 L130 105 L130 160 L70 160 Z' fill='#0f172a' /><path d='M85 105 L115 105 L100 135 Z' fill='white' /><circle cx='100' cy='118' r='3' fill='#e2e8f0' /><path d='M70 105 L95 115 L95 125 L70 115 Z' fill='#1e293b' /><path d='M130 105 L105 115 L105 125 L130 115 Z' fill='#1e293b'/></g> ),
    "Kimono": () => ( <g><path d='M70 105 L130 105 L130 160 L70 160 Z' fill='#831843'/><path d='M70 105 L100 160' stroke='#fecdd3' stroke-width='5' /><path d='M130 105 L100 160' stroke='#fecdd3' stroke-width='5' /><rect x='90' y='120' width='20' height='5' fill='#f9a8d4' /></g> ),
    "Raincoat": () => ( <g><path d='M65 105 L135 105 L135 160 L65 160 Z' fill='#facc15' /><path d='M65 90 C 65 70 135 70 135 90' fill='#facc15' /></g> ),
    "Puffy Vest": () => ( <g><path d='M75 105 L125 105 L125 155 L75 155 Z' fill='#4f46e5' /><path d='M75 120 L125 120' stroke='white' stroke-opacity='0.2' stroke-width='4' /><path d='M75 135 L125 135' stroke='white' stroke-opacity='0.2' stroke-width='4' /></g> ),
    "Fur Coat": () => ( <g><path d='M60 105 L140 105 L140 160 L60 160 Z' fill='#d2b48c' /><path d='M60 105 Q 100 90 140 105' fill='#f5f5dc'/></g> ),
    "Dragon Scale Mail": () => ( <g><defs><pattern id='scales' patternUnits='userSpaceOnUse' width='10' height='10'><path d='M 5,0 l 5,5 l -5,5 l -5,-5 z' fill='#22c55e' stroke='#166534' stroke-width='0.5'/></pattern></defs><rect x='65' y='105' width='70' height='50' fill='url(#scales)' /></g> ),
    "Star-Lord Jacket": () => ( <g><path d='M70 105 L130 105 L130 155 L70 155 Z' fill='#8c2d19'/><rect x='75' y='110' width='50' height='5' fill='#eab308' /><rect x='75' y='120' width='10' height='20' fill='#a16207' /></g> ),
    "Magical Girl Outfit": () => ( <g><path d='M70 105 L130 105 L130 150 L70 150 Z' fill='white'/><path d='M85 105 L115 105 L100 120 Z' fill='#fb7185' /><path d='M80 125 L120 125 L120 140 L100 150 L80 140 Z' fill='#fb7185' /><circle cx='100' cy='105' r='8' fill='yellow'/></g> ),
    "Steampunk Attire": () => ( <g><path d='M75 105 L125 105 L120 155 L80 155 Z' fill='#8B4513' /><path d='M80 105 L120 105 L115 150 L85 150 Z' fill='white' /><circle cx='85' cy='115' r='5' fill='#DAA520' /><circle cx='115' cy='135' r='8' stroke='#DAA520' stroke-width='2' fill='none'/></g> ),
    "Glowing Runes": () => ( <g><path d='M70 105 L130 105 L130 155 L70 155 Z' fill='black'/><text x='100' y='135' font-size='30' fill='#0ea5e9' text-anchor='middle' style={{textShadow:'0 0 5px #0ea5e9'}}>ᛗ</text></g> ),

};

const shoeComponents: Record<string, React.FC> = {
    "Boots": () => (
        <g>
            <rect x='70' y='170' width='25' height='15' rx='5' fill='#8B4513' />
            <rect x='105' y='170' width='25' height='15' rx='5' fill='#8B4513' />
        </g>
    ),
     "Hiking Boots": () => (
        <g>
            <rect x='70' y='170' width='25' height='18' rx='5' fill='#a0522d' />
            <rect x='70' y='180' width='25' height='8' fill='#654321' />
            <rect x='105' y='170' width='25' height='18' rx='5' fill='#a0522d' />
            <rect x='105' y='180' width='25' height='8' fill='#654321' />
        </g>
    ),
     "Moccasins": () => (
        <g>
            <path d='M70 175 L95 175 L90 185 L75 185 Z' fill='#deb887' />
            <path d='M105 175 L130 175 L125 185 L110 185 Z' fill='#deb887' />
            <line x1="75" y1="175" x2="90" y2="175" stroke="#8B4513" strokeWidth="1" strokeDasharray="2,2"/>
            <line x1="110" y1="175" x2="125" y2="175" stroke="#8B4513" strokeWidth="1" strokeDasharray="2,2"/>
        </g>
    ),
     "Pilgrim Shoes": () => (
        <g>
            <path d='M65 175 L100 175 L95 188 L70 188 Z' fill='#222' />
            <path d='M105 175 L140 175 L135 188 L110 188 Z' fill='#222' />
            <rect x='78' y='173' width='10' height='6' fill='#f0e68c' />
            <rect x='118' y='173' width='10' height='6' fill='#f0e68c' />
        </g>
    ),
     "Football Cleats": () => (
        <g>
            <path d='M65 175 L100 175 L95 185 L65 185 Z' fill='black' />
            <rect x='75' y='185' width='5' height='3' fill='white' />
            <rect x='85' y='185' width='5' height='3' fill='white' />
            <path d='M105 175 L140 175 L135 185 L105 185 Z' fill='black' />
            <rect x='115' y='185' width='5' height='3' fill='white' />
            <rect x='125' y='185' width='5' height='3' fill='white' />
        </g>
    ),
    "Sneakers": () => (
        <g>
            <path d='M70,175 L95,175 L95,185 L70,185 Z' fill='white' />
            <path d='M70,180 L75,175' stroke='red' strokeWidth='2' />
            <path d='M105,175 L130,175 L130,185 L105,185 Z' fill='white' />
            <path d='M105,180 L110,175' stroke='red' strokeWidth='2' />
        </g>
    ),
    "Rocket Boots": () => (
        <g>
            <rect x='65' y='170' width='30' height='20' rx='8' fill='#D3D3D3'/>
            <rect x='105' y='170' width='30' height='20' rx='8' fill='#D3D3D3'/>
            <ellipse cx='80' cy='195' rx='10' ry='5' fill='orange'><animate attributeName='ry' values='5;8;5' dur='0.5s' repeatCount='indefinite' /></ellipse>
            <ellipse cx='120' cy='195' rx='10' ry='5' fill='orange'><animate attributeName='ry' values='5;8.5;5' dur='0.5s' repeatCount='indefinite' /></ellipse>
        </g>
    ),
    "Sandals": () => (
        <g>
            <path d='M70 180 L95 180 L95 185 L70 185 Z' fill='#8B4513' />
            <path d='M75 175 L80 185' stroke='#A0522D' strokeWidth='3' />
             <path d='M105 180 L130 180 L130 185 L105 185 Z' fill='#8B4513' />
            <path d='M110 175 L115 185' stroke='#A0522D' strokeWidth='3' />
        </g>
    ),
    "Formal Shoes": () => (
        <g>
            <path d='M65 175 L100 175 L95 185 L65 185 Z' fill='black' />
            <path d='M100 175 L135 175 L135 185 L105 185 Z' fill='black' />
        </g>
    ),
    "Flip Flops": () => (
        <g>
            <path d='M70 182 L95 182 L95 187 L70 187 Z' fill='cyan' />
            <path d='M82 175 C 75 175, 75 182, 82 182' stroke='blue' strokeWidth='2' fill='none'/>
            <path d='M110 182 L135 182 L135 187 L110 187 Z' fill='cyan' />
            <path d='M122 175 C 115 175, 115 182, 122 182' stroke='blue' strokeWidth='2' fill='none'/>
        </g>
    ),
    "Clogs": () => (
        <g>
            <path d='M65 175 L100 175 L95 190 L65 190 Z' fill='brown' />
            <path d='M105 175 L140 175 L135 190 L105 190 Z' fill='brown' />
        </g>
    ),
    "Ice Skates": () => (
        <g>
            <path d='M65 175 L100 175 L95 185 L65 185 Z' fill='white' />
            <rect x='70' y='185' width='20' height='5' fill='silver' />
            <path d='M105 175 L140 175 L135 185 L105 185 Z' fill='white' />
            <rect x='110' y='185' width='20' height='5' fill='silver' />
        </g>
    ),
    "Roller Skates": () => (
        <g>
            <path d='M65 175 L100 175 L95 185 L65 185 Z' fill='pink' />
            <circle cx='75' cy='190' r='5' fill='yellow' />
            <circle cx='90' cy='190' r='5' fill='yellow' />
            <path d='M105 175 L140 175 L135 185 L105 185 Z' fill='pink' />
            <circle cx='115' cy='190' r='5' fill='yellow' />
            <circle cx='130' cy='190' r='5' fill='yellow' />
        </g>
    ),
     "Knight Boots": () => (
        <g>
            <path d="M70 170 L95 170 L100 185 L65 185 Z" fill="#A9A9A9" />
            <path d="M105 170 L130 170 L135 185 L100 185 Z" fill="#A9A9A9" />
        </g>
    ),
    "Astronaut Boots": () => (
        <g>
            <rect x="65" y="170" width="30" height="20" rx="8" fill="white" stroke="#ccc" strokeWidth="1" />
            <rect x="105" y="170" width="30" height="20" rx="8" fill="white" stroke="#ccc" strokeWidth="1" />
        </g>
    ),
    "Hover Boots": () => (
        <g>
            <rect x="70" y="175" width="20" height="10" rx="5" fill="#333" />
            <rect x="110" y="175" width="20" height="10" rx="5" fill="#333" />
            <ellipse cx="80" cy="190" rx="15" ry="4" fill="cyan" opacity="0.7" />
            <ellipse cx="120" cy="190" rx="15" ry="4" fill="cyan" opacity="0.7" />
        </g>
    ),
};


const DefaultShoes = () => (
    <>
        <rect x="70" y="175" width="20" height="10" rx="5" fill="#333" />
        <rect x="110" y="175" width="20" height="10" rx="5" fill="#333" />
    </>
);


export const Hat: React.FC<{ name?: string }> = ({ name }) => {
    if (!name || name === 'None') return null;
    const Component = hatComponents[name];
    return Component ? <Component /> : null;
};

export const Shirt: React.FC<{ name?: string }> = ({ name }) => {
    if (!name || name === 'None') return null;
    const Component = shirtComponents[name];
    return Component ? <Component /> : null;
};

export const Shoes: React.FC<{ name?: string }> = ({ name }) => {
    if (!name || name === 'None') {
        return <DefaultShoes />;
    }
    const Component = shoeComponents[name];
    return Component ? <Component /> : <DefaultShoes />;
};

    

    


