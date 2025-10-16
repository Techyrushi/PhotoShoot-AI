# PhotoShoot AI Studio

A professional AI-powered product photography platform that transforms your product images into stunning photoshoots with models in various settings.

## Features

- **AI-Powered Generation**: Advanced AI models create realistic product photoshoots with professional models
- **Multiple Model Options**: Choose from Men, Women, or Kids models to match your target audience
- **Diverse Scene Types**: Studio, Lifestyle, Outdoor, and Creative settings
- **Instant Download**: Get high-quality, ready-to-use images immediately
- **Easy to Use**: Simple drag-and-drop interface with intuitive controls

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Google AI API key

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Google AI API key:
   ```
   GOOGLE_API_KEY=your_google_ai_api_key_here
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and go to `http://localhost:5000`

## Usage

### Homepage
- Visit the homepage to learn about the features
- Click "Try It Now" or "Start Creating" to go to the dashboard

### Dashboard
1. **Upload Product Image**: Drag and drop or click to upload your product image (PNG, JPG, WEBP up to 10MB)
2. **Select Scene Type**: Choose from Studio, Lifestyle, Outdoor, or Creative
3. **Choose Model Gender**: Select Men, Women, or Kids models
4. **Generate**: Click "Generate Photoshoot" to create your AI-powered photoshoot
5. **Download**: Download the generated image when ready

## API Endpoints

- `GET /api` - Server status and available scenes
- `GET /api/scenes` - List of available scene types
- `GET /api/genders` - List of available model genders
- `POST /api/upload` - Upload image and generate photoshoot

## Scene Types

- **Studio**: Clean, professional white background with soft lighting
- **Lifestyle**: Natural indoor home setting with warm lighting
- **Outdoor**: Bright outdoor park setting with natural daylight
- **Creative**: Artistic, bold, colorful creative advertising style

## Model Genders

- **Men**: Male models for adult products
- **Women**: Female models for adult products  
- **Kids**: Child models for children's products

## Technical Details

- **Backend**: Node.js with Express
- **AI Model**: Google Gemini 2.5 Flash Image
- **Frontend**: Vanilla JavaScript with modern CSS
- **File Upload**: Multer for handling image uploads
- **Image Processing**: Sharp for image optimization

## File Structure

```
PhotoShoot-AI/
├── public/
│   ├── index.html          # Homepage
│   ├── dashboard.html      # Main application dashboard
│   └── app.js             # Legacy file (not used)
├── uploads/               # Uploaded product images
├── outputs/              # Generated photoshoot images
├── server.js             # Backend server
├── package.json          # Dependencies
└── README.md            # This file
```

## Troubleshooting

- **API Key Error**: Make sure your Google AI API key is correctly set in the `.env` file
- **Upload Issues**: Ensure your image is under 10MB and in a supported format
- **Generation Fails**: Check your internet connection and API key validity

## License

This project is for educational and commercial use.
