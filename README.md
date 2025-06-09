# 🚰 Pakli.com - Sofia Water Outages Monitor

A real-time monitoring platform for public utility interruptions in Sofia, Bulgaria.

## 🌟 Features

- **🗺️ Interactive Maps** - 2D Leaflet, 3D Mapbox, and Google Maps 3D
- **📱 Real-time Updates** - Live outage notifications
- **🔍 Advanced Filtering** - Filter by service type, district, severity
- **👤 User Accounts** - Personalized notifications for your district
- **💳 Premium Features** - Enhanced notifications and priority support
- **📊 Statistics** - Comprehensive outage analytics
- **🌙 Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Maps**: Leaflet, Mapbox GL, Google Maps API
- **Deployment**: Vercel

## 🚀 Quick Start

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/kristiyan-velkov/pakli.git
   cd pakli
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Add your API keys:
   \`\`\`env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗺️ Map Integration

### Google Maps 3D
- Real 3D buildings of Sofia
- Satellite imagery
- Interactive tilt and rotation controls
- Custom markers for different utility types

### Mapbox 3D
- 3D terrain and buildings
- Custom styling
- Smooth animations
- WebGL acceleration

### Leaflet 2D
- Fast and lightweight
- OpenStreetMap data
- Custom markers and popups
- Mobile-optimized

## 📊 Data Sources

- **Софийска вода** - Water utility outages
- **ЧЕЗ България** - Electricity outages  
- **Топлофикация София** - Heating outages

## 🏗️ Project Structure

\`\`\`
pakli/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── maps/             # Map components
│   └── ...               # Feature components
├── lib/                  # Utilities and stores
│   ├── store.ts          # Zustand store
│   └── utils.ts          # Helper functions
└── public/               # Static assets
\`\`\`

## 🔧 Configuration

### Google Maps API
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Enable Maps JavaScript API
3. Add your domain to API restrictions
4. Set billing account (free tier available)

### Mapbox
1. Sign up at [Mapbox](https://www.mapbox.com/)
2. Get access token from your account
3. Add to environment variables

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect to Vercel**
   \`\`\`bash
   npx vercel
   \`\`\`

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   \`\`\`bash
   npx vercel --prod
   \`\`\`

### Manual Deployment

1. **Build the project**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start production server**
   \`\`\`bash
   npm start
   \`\`\`

## 🌍 Environment Variables

\`\`\`env
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Database (optional)
DATABASE_URL=your_database_url

# Authentication (optional)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
\`\`\`

## 📱 Features Overview

### 🗺️ Maps
- **2D Map**: Fast Leaflet-based map with OpenStreetMap
- **3D Map**: Mapbox GL with 3D buildings and terrain
- **Google 3D**: Real Google Maps with satellite imagery

### 🔍 Filtering
- Service type (water, electricity, heating)
- Outage type (emergency, scheduled)
- District/neighborhood
- Severity level

### 👤 User Features
- District-based notifications
- Premium subscription
- Personalized dashboard
- Email alerts

### 📊 Analytics
- Real-time statistics
- Historical data
- Outage trends
- Service reliability metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

- **Website**: [pakli.com](https://pakli.com)
- **Email**: support@pakli.com
- **GitHub Issues**: [Report a bug](https://github.com/kristiyan-velkov/pakli/issues)

---

Made with ❤️ for Sofia, Bulgaria 🇧🇬
