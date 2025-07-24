# Events App

A modern, mobile-optimized React events application with Material UI and Firebase backend. This app provides comprehensive event management features including RSVP tracking, guest communication, budget management tools, social media integration, and planning for future AI and API enhancements.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Features

### Core Features

- **Event Management**: Create, edit, and manage events with detailed information
- **RSVP Tracking**: Track guest responses and manage attendee lists
- **Guest Communication**: Send messages and updates to event attendees
- **Budget Management**: Track expenses, revenue, and overall budget health
- **Social Media Integration**: Share events on social platforms and schedule promotional posts
- **Calendar View**: Visualize events in a calendar format

### Technical Features

- Mobile-first, responsive design
- Material UI components for modern UI/UX
- Firebase backend for authentication and data storage
- React Router for navigation
- Syncfusion components for advanced UI elements

## Project Structure

```plaintext
events-app/
├── public/
├── src/
│   ├── components/
│   │   ├── budget/
│   │   ├── events/
│   │   ├── guests/
│   │   ├── integrations/
│   │   ├── layout/
│   │   └── social/
│   ├── pages/
│   ├── services/
│   ├── theme/
│   ├── App.js
│   └── index.js
└── package.json
```

## Navigation

The app includes a consistent navigation system across event-related pages using the `EventNavigation` component, which provides access to:

- Event Details
- Guest Management
- Budget Management
- Social Media Promotion
- Schedule
- Gallery

## Future Enhancements

### AI Features (Planned)

- Smart guest recommendations
- Automated content generation
- Sentiment analysis for feedback
- Chatbot assistant

### API Integrations (Planned)

- Payment gateways
- Contact enrichment
- Translation services
- Image recognition
- Push notifications
- Analytics integration
- Identity verification

## Learn More

For more information about the technologies used:

- [React Documentation](https://reactjs.org/)
- [Material UI Documentation](https://mui.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Syncfusion React Components](https://www.syncfusion.com/react-components)
