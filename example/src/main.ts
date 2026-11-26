import './style.css';
import { createRoot } from '@nuvo-js/core'
import App from './App';

const root = document.getElementById('app');

createRoot(root!, App());

const nuvojs = window.nuvojs

console.log(nuvojs)

