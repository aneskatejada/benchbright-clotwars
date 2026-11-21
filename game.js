import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// These three optional GLBs are taken from the user's optimized 3D integration kit.
// The page works with procedural preview geometry until the files are uploaded.
const ASSETS = {
  rbc: './models/red_blood_cell.glb',
  platelet: './models/platelet.glb',
  anatomy: './models/blood_vessel.glb'
};
const PHASES = {
  normal: {
    name: 'Normal hemostasis',
    title: 'Fibrin-stabilized platelet plug',
    desc: 'Platelets adhere at a vascular injury. Coagulation generates thrombin and fibrin, which reinforce the initial platelet plug.',
    warning: false
  },
  deficiency: {
    name: 'Hemophilia A',
    title: 'Factor VIII deficiency',
    desc: 'Primary platelet adhesion can still occur, but factor VIII deficiency reduces intrinsic tenase activity, thrombin generation, and fibrin reinforcement.',
    warning: true
  },
  corrected: {
    name: 'FVIII replacement',
    title: 'Illustrative correction',
    desc: 'Simulated replacement of factor VIII restores fibrin reinforcement in this simplified educational scene; this is not a treatment prediction.',
    warning: false
  }
};

const host = document.querySelector('#scene-root');
const statusEl = document.querySelector('#model-status');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#07131f');
const camera = new THREE.PerspectiveCamera(47, 1, 0.1, 100);
camera.position.set(0, 2.7, 12.5);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.minDistance = 4.8;
controls.maxDistance = 18;
scene.add(new THREE.HemisphereLight('#a5d2f5', '#5a102f', 2.4));
const light = new THREE.DirectionalLight('#fff2ed', 3.1);
light.position.set(2, 7, 9);
scene.add(light);
const blush = new THREE.PointLight('#ff536a', 34, 15);
blush.position.set(-4, -2, 6);
scene.add(blush);

const flow = new THREE.Group();
const anatomy = new THREE.Group();
scene.add(flow, anatomy);
anatomy.visible = false;
const redMaterial = new THREE.MeshStandardMaterial({color: '#c92e4c', roughness: 0.49, metalness: 0.05, side: THREE.DoubleSide});
const plateletMaterial = new THREE.MeshStandardMaterial({color: '#eda7c8', roughness: 0.6});
const vesselMaterial = new THREE.MeshStandardMaterial({color: '#8c264b', side: THREE.DoubleSide, transparent: true, opacity: 0.48, roughness: 0.8, depthWrite: false});

function createRBCPreview() {
  // Radial cross-section revolved around Y gives an indented biconcave disc.
  const radial = [[0,.18],[.25,.19],[.53,.27],[.79,.31],[.96,.18],[1,0],[.96,-.18],[.79,-.31],[.53,-.27],[.25,-.19],[0,-.18]];
  const geometry = new THREE.LatheGeometry(radial.map(([r, y]) => new THREE.Vector2(r, y)), 28);
  const cell = new THREE.Mesh(geometry, redMaterial);
  cell.rotation.z = 0.75;
  return cell;
}
function createPlateletPreview() {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.39, 1), plateletMaterial));
  for(let i=0;i<7;i++) {
    const a = i * Math.PI * 2 / 7;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(.065,.55,6), plateletMaterial);
    spike.position.set(Math.cos(a)*.54, Math.sin(a)*.54, Math.sin(i*2.2)*.13);
    spike.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(Math.cos(a),Math.sin(a),0));
    group.add(spike);
  }
  return group;
}
function tubeBetween(parent, start, end, radius, material) {
  const startV = new THREE.Vector3(...start), endV = new THREE.Vector3(...end);
  const direction = endV.clone().sub(startV);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.12, direction.length(), 20, 1, true), material);
  mesh.position.copy(startV).add(endV).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), direction.normalize());
  parent.add(mesh);
  return mesh;
}
function createAnatomyPreview() {
  const group = new THREE.Group();
  const tissue = new THREE.MeshStandardMaterial({color:'#d15b79',roughness:.66, side:THREE.DoubleSide,transparent:true,opacity:.87});
  tubeBetween(group,[0,-2.9,0],[0,2.65,0],.68,tissue);
  tubeBetween(group,[0,1.35,0],[2.2,2.5,0.1],.38,tissue);
  tubeBetween(group,[0,1.25,0],[-2.35,2.3,-.2],.35,tissue);
  tubeBetween(group,[0,-1.45,0],[2.4,-2.5,.3],.36,tissue);
  tubeBetween(group,[0,-1.2,0],[-2.1,-2.4,-.35],.4,tissue);
  return group;
}
const anatomyAnchor = new THREE.Group();
anatomy.add(anatomyAnchor);
anatomyAnchor.add(createAnatomyPreview());

const injury = new THREE.Vector3(1.4, 1.6, .55);
const tube = new THREE.Mesh(new THREE.CylinderGeometry(2.05,2.05,11.75,64,1,true,Math.PI * .75,Math.PI * 1.5), vesselMaterial);
tube.rotation.z = Math.PI / 2;
flow.add(tube);
for (const x of [-5.88, 5.88]) {
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.05,.085,10,64), new THREE.MeshStandardMaterial({color:'#d8748f',transparent:true,opacity:.77}));
  rim.position.x = x;
  rim.rotation.y = Math.PI/2;
  flow.add(rim);
}
const wound = new THREE.Mesh(new THREE.SphereGeometry(.59,22,16),new THREE.MeshStandardMaterial({color:'#fc6a79',roughness:.6,emissive:'#a5344a',emissiveIntensity:.6}));
wound.position.copy(injury);
wound.rotation.set(.25,0,.3);
flow.add(wound);

const rbcs = [];
const plateletGroups = [];
const coords = [[-5.2,-.7,.2],[-4.4,.8,-.4],[-3.7,.1,.9],[-3.2,-.9,-.5],[-2.2,.5,-.2],[-1.5,-.6,.7],[-.9,.6,-.9],[-.2,-.3,-.3],[.3,.3,1],[1.4,-.7,.2],[2.1,.6,.6],[2.7,-.3,-.6],[3.2,.9,-.1],[3.9,-.8,.9],[4.7,.1,.2],[5.1,.7,-.6]];
for(let i=0;i<coords.length;i++) {
  const holder = new THREE.Group();
  holder.position.set(...coords[i]);
  holder.scale.setScalar(.65);
  holder.add(createRBCPreview());
  flow.add(holder);
  rbcs.push({holder, x:coords[i][0], i});
}
for(let i=0;i<11;i++) {
  const holder = new THREE.Group();
  holder.position.set(-5.3+i*.78,(i%4)*.4-.5,((i*3)%7)*.2-.6);
  holder.scale.setScalar(.27);
  holder.add(createPlateletPreview());
  flow.add(holder);
  const target = new THREE.Vector3(injury.x+Math.sin(i*2.4)*.67,injury.y-Math.abs(Math.cos(i*1.7)*.25),injury.z+Math.cos(i*2.4)*.55);
  plateletGroups.push({holder,target});
}
const fibrin = [];
for(let i=0;i<32;i++) {
  const a=i*2.4,b=a+Math.PI*.92;
  const points=[new THREE.Vector3(injury.x+Math.cos(a)*1.02,injury.y-.4,injury.z+Math.sin(a)*.7),new THREE.Vector3(injury.x+Math.cos(b)*.93,injury.y-.1,injury.z+Math.sin(b)*.68)];
  const strand = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#f0eaf6',transparent:true,opacity:.78}));
  flow.add(strand);
  fibrin.push(strand);
}

let phase = 'deficiency';
let playing = true;
let view = 'flow';
function setPhase(key) {
  phase = key;
  const info = PHASES[key];
  document.querySelectorAll('[data-phase]').forEach(el=>{const active=el.dataset.phase===key;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
  const st=document.querySelector('#phase-status');
  st.classList.toggle('warning', info.warning);
  document.querySelector('#phase-name').textContent=info.name;
  document.querySelector('#phase-title').textContent=info.title;
  document.querySelector('#phase-description').textContent=info.desc;
  fibrin.forEach((strand,i)=>{strand.visible=i<(key==='deficiency'?4:32);});
  setView('flow');
}
function setView(next) {
  view=next;
  flow.visible=next==='flow';
  anatomy.visible=next==='anatomy';
  document.querySelector('#view-flow').classList.toggle('selected',next==='flow');
  document.querySelector('#view-anatomy').classList.toggle('selected',next==='anatomy');
  document.querySelector('#view-flow').setAttribute('aria-pressed',String(next==='flow'));
  document.querySelector('#view-anatomy').setAttribute('aria-pressed',String(next==='anatomy'));
  camera.position.set(0,next==='flow'?2.7:1.2,next==='flow'?12.5:10);
  controls.target.set(0,0,0);
  controls.update();
}
document.querySelectorAll('[data-phase]').forEach(btn => btn.addEventListener('click',()=>setPhase(btn.dataset.phase)));
document.querySelector('#view-flow').addEventListener('click',()=>setView('flow'));
document.querySelector('#view-anatomy').addEventListener('click',()=>setView('anatomy'));
document.querySelector('#play-pause').addEventListener('click',()=>{playing=!playing;document.querySelector('#play-pause').textContent=playing?'❚❚ Pause':'▶ Play';});
setPhase('deficiency');

// Import and center the user's GLBs, preserving their geometry/materials.
function normalizedAsset(gltf, diameter) {
  const obj=gltf.scene.clone(true);
  obj.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(obj);
  const center=box.getCenter(new THREE.Vector3());
  const extent=box.getSize(new THREE.Vector3());
  const scale=diameter/Math.max(extent.x,extent.y,extent.z,.001);
  obj.scale.multiplyScalar(scale);
  obj.position.addScaledVector(center,-scale);
  return obj;
}
function replacePreview(holder,model) {
  // Keep movement group transforms; replace only the enclosed geometry.
  holder.clear();
  holder.add(model);
}
const loader = new GLTFLoader();
let available=0;
function updateAssetStatus() {
  statusEl.textContent=available===3?'✓ All three uploaded GLBs loaded':available>0?`✓ ${available}/3 uploaded models loaded · placeholders for others`:'Preview models · Upload your 3 GLBs to enable originals';
}
function loadAsset(key, whenReady) {
  loader.load(ASSETS[key], gltf=>{
    available++;
    whenReady(gltf);
    updateAssetStatus();
  },undefined,()=>updateAssetStatus());
}
loadAsset('rbc', gltf=>{
  rbcs.forEach(({holder})=>replacePreview(holder,normalizedAsset(gltf,1.2)));
  document.querySelector('#rbc-legend').textContent='uploaded GLB';
});
loadAsset('platelet', gltf=>{
  plateletGroups.forEach(({holder})=>replacePreview(holder,normalizedAsset(gltf,1.1)));
  document.querySelector('#plt-legend').textContent='uploaded GLB';
});
loadAsset('anatomy', gltf=>replacePreview(anatomyAnchor,normalizedAsset(gltf,5.7)));

function resize() {
  const width=Math.max(1,host.clientWidth), height=Math.max(1,host.clientHeight);
  camera.aspect=width/height;
  camera.updateProjectionMatrix();
  renderer.setSize(width,height,false);
}
if(window.ResizeObserver) new ResizeObserver(resize).observe(host);
window.addEventListener('resize', resize);
resize();
const clock=new THREE.Clock();
let t=0;
function tick() {
  requestAnimationFrame(tick);
  const dt=Math.min(clock.getDelta(),.06);
  if (playing) {
    t+=dt;
    rbcs.forEach(({holder,x,i})=>{
      holder.position.x=-5.7+((x+5.7+t*(.65+(i%4)*.12))%11.4);
      holder.rotation.y=t*.3+i*.7;
      holder.rotation.z=t*.14+i;
    });
    plateletGroups.forEach(({holder,target})=>{
      holder.position.lerp(target, 1-Math.exp(-dt*.9));
      holder.rotation.y+=dt*.25;
    });
    anatomyAnchor.rotation.y+=dt*.08;
  }
  controls.update();
  renderer.render(scene,camera);
}
tick();
