/* AEGIS / Tabler color-mode controller — persistent dark, light and system.
 * Same-origin, CSP-safe, shared by public console, private ISC and workbench.
 */
(function(){
'use strict';
const storage='aegis_color_mode_v1';
const modes=['dark','light','system'];
let mode='dark';
try{const saved=localStorage.getItem(storage);if(modes.includes(saved))mode=saved}catch{}
const media=typeof window.matchMedia==='function'?window.matchMedia('(prefers-color-scheme: dark)'):null;
function effective(){return mode==='system'?(media?.matches?'dark':'light'):mode}
function paint(){
 const value=effective(),html=document.documentElement;
 html.setAttribute('data-bs-theme',value);
 html.setAttribute('data-aegis-theme',value);
 html.setAttribute('data-aegis-mode',mode);
 html.style.colorScheme=value;
 document.querySelectorAll('[data-theme-choice]').forEach(button=>{
  const selected=button.dataset.themeChoice===mode;
  button.setAttribute('aria-pressed',String(selected));
  button.classList.toggle('active',selected);
 });
 document.querySelectorAll('[data-theme-toggle]').forEach(button=>{
  button.setAttribute('aria-label',value==='dark'?'Switch to light appearance':'Switch to dark appearance');
  button.setAttribute('title',value==='dark'?'Switch to light appearance':'Switch to dark appearance');
 });
 document.dispatchEvent(new CustomEvent('aegis:theme',{detail:{mode,effective:value}}));
}
function set(next){if(!modes.includes(next))return;mode=next;try{localStorage.setItem(storage,next)}catch{}paint()}
function cycle(){set(effective()==='dark'?'light':'dark')}
window.AegisTheme={set,cycle,current:()=>mode,effective};
document.documentElement.dataset.bsTheme=effective();
document.documentElement.dataset.aegisTheme=effective();
document.documentElement.dataset.aegisMode=mode;
document.documentElement.style.colorScheme=effective();
document.addEventListener('DOMContentLoaded',()=>{
 document.addEventListener('click',event=>{
  const choice=event.target.closest('[data-theme-choice]'),toggle=event.target.closest('[data-theme-toggle]');
  if(choice){event.preventDefault();set(choice.dataset.themeChoice)}
  else if(toggle){event.preventDefault();cycle()}
 });
 paint();
});
media?.addEventListener?.('change',()=>{if(mode==='system')paint()});
window.addEventListener('storage',event=>{
 if(event.key===storage&&modes.includes(event.newValue)){mode=event.newValue;paint()}
});
})();