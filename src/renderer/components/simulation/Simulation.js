import { gsap } from 'gsap';
import CalysSvg from './calys.js';
import React, { useState, useEffect, useRef } from 'react';

const Simulation = () => {
	const [pointsMesure, setPointsMesure] = useState(0);

	const [isPortSelected, setIsPortSelected] = useState(false);
	const [actif, setActif] = useState(false);
	const [xPos, setXPos] = useState(null);
	const [ports, setPorts] = useState(null);
	const myRef = useRef(null);
	const TL = useRef(null);
	useEffect(() => {
		window.electron.ipcRenderer.initCalys();
		window.electron.ipcRenderer.on('initCalys', (arg) => {
			console.log('initCalys');
			console.log(arg);
			setPorts(arg);
		});

		TL.current = gsap
			.timeline({ paused: true, repeat: -1 })
			.to(myRef.current, {
				duration: 1.5,
				x: 600,
				y: -200,
				rotate: 20,
				opacity: 0,
				transformOrigin: 'center center',
				ease: 'back-in(1.7)',
				delay: 1.5,
			});
		// TL.current.play()
		// .to(myRef.current,{duration:1,scale:2})
	}, []);
	useEffect(() => {
		actif ? TL.current.play() : TL.current.pause();
	}, [actif]);
	const handleClick = () => {
		console.log('coucou');
		setActif(!actif);
	};

	const ptsTTH = [760, 1000, 1100, 1210, 1270];
	useEffect(() => {
		window.electron.ipcRenderer.on('ecritureCalys', (arg) => {
			// eslint-disable-next-line no-console
			console.log('arg from ecritureCalys');
			console.log(arg);
		});
		document.addEventListener('keydown', (event) => {
			if (event.key == 'ArrowRight') {
				setPointsMesure((pointsMesure) => pointsMesure + 1);
			}
		});
	}, []);
	useEffect(() => {
		window.electron.ipcRenderer.ecriture(ptsTTH[pointsMesure]);
	}, [pointsMesure]);
	const handlePortChoice = (com) => {
		console.log(com.path);
		setIsPortSelected(true);
		window.electron.ipcRenderer.ChoixCalys(com.path);

	};
	return (
		<>
			{!ports && <h1>AUCUN EQUIPEMENT DE BRANCHE!!</h1>}
			{ports && !isPortSelected && (
				<div
					className={isPortSelected ? 'mainPortsOpaque' : 'mainPorts'}
				>
					{ports.map((e) => (
						<li onClick={()=>handlePortChoice(e)}>
							{e.path} - {e.productId} - {e.manufacturer}
						</li>
					))}
				</div>
			)}
			{ports && isPortSelected && (<div className="mainSimulation">
				{['TTH', 'MINIDIAMANT', 'BMI54'].map((four, index) => (
					<button
						type="button"
						onClick={() =>
							window.electron.ipcRenderer.ecriture(four)
						}
					>
						<span role="img" aria-label="books">
							📚
						</span>
						{four}
					</button>
				))}
				<div className="calysContainer" onClick={handleClick}>
					<CalysSvg />

					<h1 ref={myRef} className="valeur">
					{ptsTTH[pointsMesure]+'°C'}</h1>
				</div>
			</div>
			)}
		</>
	);
};

export default Simulation;
