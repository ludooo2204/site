import React, { useEffect, useState } from 'react';
// import { useTable } from "react-table";
import { MemoryRouter as Router, Switch, Route, Link } from 'react-router-dom';

import {
	useTable,
	useFilters,
	useGlobalFilter,
	useAsyncDebounce,
	useRowSelect,
} from 'react-table';
// A great library for fuzzy filtering/sorting items
import matchSorter from 'match-sorter';
import InterventionAtelier from './InterventionAtelier';
const IndeterminateCheckbox = React.forwardRef(
	({ indeterminate, ...rest }, ref) => {
		const defaultRef = React.useRef();
		const resolvedRef = ref || defaultRef;

		React.useEffect(() => {
			resolvedRef.current.indeterminate = indeterminate;
		}, [resolvedRef, indeterminate]);

		return (
			<>
				<input type="checkbox" ref={resolvedRef} {...rest} />
			</>
		);
	}
);

const RechercheDeca = () => {
	const [dbECME, setDbECME] = useState(null);

	const [datas, setDatas] = useState(null);
	const [isTableVisible, setTableVisible] = useState(true);
	const [exportedData, setExportedData] = useState([]);
	const [db, setDb] = useState(null);
	const [itemsList, setItemsList] = useState(null);
	const [tagOperateurList, setTagOperateurList] = useState(null);
	let newItems = [];
	let newItems4db = [];
	useEffect(() => {
		console.log('toto');
		window.electron.ipcRenderer.lectureDBecme();

		window.electron.ipcRenderer.on('lectureDBecme', (arg) => {
			console.log('arg');

			console.log(arg);
			setDbECME(arg);
		});
	}, []);
	useEffect(() => {
		console.log('lectureDB');
		window.electron.ipcRenderer.lectureDB();

		window.electron.ipcRenderer.on('lectureDB', (arg) => {
			console.log('arg');
			console.log(arg);
			arg.forEach((element) => {
				element.date_prevue = new Date(
					element.date_prevue
				).toLocaleDateString('FR-fr');
			});
			setDatas(arg);
		});
		window.electron.ipcRenderer.on('insererDB', (arg) => {
			console.log('arg insert');
			// window.electron.ipcRenderer.lectureDB();
			console.log(arg);
		});
		window.electron.ipcRenderer.on('effacerDB', (arg) => {
			console.log('arg');
			console.log(arg);
			window.electron.ipcRenderer.lectureDB();
		});
		window.electron.ipcRenderer.on('insererDBinterventions', (arg) => {
			console.log('insertion interventions');
			console.log(arg);
			// window.electron.ipcRenderer.lectureDB();
		});
	}, []);
	useEffect(() => {
		console.log('exportedData');
		console.log(exportedData);
	}, [exportedData]);
	useEffect(() => {
		window.electron.ipcRenderer.on('xlsBainDrop', (arg) => {
			// eslint-disable-next-line no-console
			console.log('arg from xlsBain');
			arg.forEach((element) => {
				element.date_prevue = new Date(
					element.date_prevue
				).toLocaleDateString('FR-fr');
			});
			console.log(arg);
			setDatas(arg);
		});
		document.body.addEventListener('dragover', (evt) => {
			evt.preventDefault();
			console.log('dragover');
		});

		document.addEventListener('drop', (event) => {
			console.log('hello');
			event.preventDefault();
			event.stopPropagation();

			for (const f of event.dataTransfer.files) {
				// Using the path attribute to get absolute file path
				console.log('File Path of dragged files: ', f.path);
				window.electron.ipcRenderer.xlsBainDrop(f.path);
			}
		});
	}, []);
	const columns = React.useMemo(
		() => [
			{
				Header: 'Marquage',
				accessor: 'marquage',
				// Use our custom `fuzzyText` filter on this column
				// filter: 'fuzzyText',
			},
			{
				Header: 'emplacement',
				accessor: 'service4',
				// Use our custom `fuzzyText` filter on this column
				// filter: 'fuzzyText',
			},

			{
				Header: 'Famille',
				accessor: 'famille',
				Filter: SelectColumnFilter,
				filter: 'includes',
			},
			{
				Header: 'Date de future intervention',
				accessor: 'date_prevue',
				// Filter: NumberRangeColumnFilter,
				// filter: 'between',
			},
			{
				Header: 'Periodicité',
				accessor: 'periode',
			},
			{
				Header: 'Libellelé 6',
				accessor: 'libelle6',
			},
			{
				Header: 'Tolerance',
				accessor: 'string6',
			},
			{
				Header: 'Applications',
				accessor: 'application',
			},
		],

		[]
	);

	// Define a default UI for filtering
	function GlobalFilter({
		preGlobalFilteredRows,
		globalFilter,
		setGlobalFilter,
	}) {
		const count = preGlobalFilteredRows.length;
		const [value, setValue] = React.useState(globalFilter);
		const onChange = useAsyncDebounce((value) => {
			console.log(value);
			setGlobalFilter(value || undefined);
		}, 200);

		return (
			<span>
				Search:{' '}
				<input
					value={value || ''}
					onChange={(e) => {
						setValue(e.target.value);
						onChange(e.target.value);
					}}
					placeholder={`${count} records...`}
					style={{
						fontSize: '1.1rem',
						border: '0',
					}}
				/>
			</span>
		);
	}

	// Define a default UI for filtering
	function DefaultColumnFilter({
		column: { filterValue, preFilteredRows, setFilter },
	}) {
		const count = preFilteredRows.length;
		return (
			<input
				className="inputRecherche"
				value={filterValue || ''}
				onChange={(e) => {
					setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
				}}
				placeholder={`Recherche`}
				//  ${count} records...`}
			/>
		);
	}

	// This is a custom filter UI for selecting
	// a unique option from a list
	function SelectColumnFilter({
		column: { filterValue, setFilter, preFilteredRows, id },
	}) {
		// Calculate the options for filtering
		// using the preFilteredRows
		const options = React.useMemo(() => {
			const options = new Set();
			preFilteredRows.forEach((row) => {
				options.add(row.values[id]);
			});
			return [...options.values()];
		}, [id, preFilteredRows]);

		// Render a multi-select box
		return (
			<select
				className="selectFamille"
				value={filterValue}
				onChange={(e) => {
					setFilter(e.target.value || undefined);
				}}
			>
				<option value="">All</option>
				{options.map((option, i) => (
					<option className="optionFamille" key={i} value={option}>
						{option}
					</option>
				))}
			</select>
		);
	}

	// This is a custom UI for our 'between' or number range
	// filter. It uses two number boxes and filters rows to
	// ones that have values between the two
	function NumberRangeColumnFilter({
		column: { filterValue = [], preFilteredRows, setFilter, id },
	}) {
		const [min, max] = React.useMemo(() => {
			let min = preFilteredRows.length
				? preFilteredRows[0].values[id]
				: 0;
			let max = preFilteredRows.length
				? preFilteredRows[0].values[id]
				: 0;
			preFilteredRows.forEach((row) => {
				min = Math.min(row.values[id], min);
				max = Math.max(row.values[id], max);
			});
			console.log('min,max');
			console.log(min, max);
			return [min, max];
		}, [id, preFilteredRows]);

		return (
			<div
				style={{
					display: 'flex',
				}}
			>
				<input
					value={filterValue[0] || ''}
					type="number"
					onChange={(e) => {
						const val = e.target.value;
						setFilter((old = []) => [
							val ? parseInt(val, 10) : undefined,
							old[1],
						]);
					}}
					placeholder={`Min (${min})`}
					style={{
						width: '70px',
						marginRight: '0.5rem',
					}}
				/>
				to
				<input
					value={filterValue[1] || ''}
					type="number"
					onChange={(e) => {
						const val = e.target.value;
						setFilter((old = []) => [
							old[0],
							val ? parseInt(val, 10) : undefined,
						]);
					}}
					placeholder={`Max (${max})`}
					style={{
						width: '70px',
						marginLeft: '0.5rem',
					}}
				/>
			</div>
		);
	}

	function fuzzyTextFilterFn(rows, id, filterValue) {
		console.log('rows, id, filterValue');
		console.log(rows, id, filterValue);
		return matchSorter(rows, filterValue, {
			keys: [(row) => row.values[id]],
		});
	}

	// Let the table remove the filter if the string is empty
	fuzzyTextFilterFn.autoRemove = (val) => !val;

	// Our table component
	function Table({ columns, data }) {
		// console.log(columns)

		const [selectedItems, setSelectedItems] = useState(null);

		useEffect(() => {
			console.log('click');
			console.log(selectedItems);
			// if (selectedFlatRows.length>0) {

			// 	console.log(rows.filter((e) => e.isSelected));
			// 	setSelectedItems(rows.filter((e) => e.isSelected))
			// }
		}, [selectedItems]);
		console.log('render');
		const filterTypes = React.useMemo(
			() => ({
				// Add a new fuzzyTextFilterFn filter type.
				fuzzyText: fuzzyTextFilterFn,
				// Or, override the default text filter to use
				// "startWith"
				text: (rows, id, filterValue) => {
					return rows.filter((row) => {
						const rowValue = row.values[id];
						return rowValue !== undefined
							? String(rowValue)
									.toLowerCase()
									.startsWith(
										String(filterValue).toLowerCase()
									)
							: true;
					});
				},
			}),
			[]
		);

		const defaultColumn = React.useMemo(
			() => ({
				minWidth: 10,
				width: 150,
				maxWidth: 200,
				// Let's set up our default Filter UI
				Filter: DefaultColumnFilter,
			}),
			[]
		);

		const {
			getTableProps,
			getTableBodyProps,
			headerGroups,
			rows,
			prepareRow,
			state,
			visibleColumns,
			preGlobalFilteredRows,
			setGlobalFilter,
			selectedFlatRows,
			state: { selectedRowIds },
		} = useTable(
			{
				columns,
				data,
				defaultColumn, // Be sure to pass the defaultColumn option
				filterTypes,
			},
			useFilters, // useFilters!
			useGlobalFilter, // useGlobalFilter!
			useRowSelect,
			(hooks) => {
				hooks.visibleColumns.push((columns) => [
					// Let's make a column for selection
					{
						id: 'selection',
						// The header can use the table's getToggleAllRowsSelectedProps method
						// to render a checkbox
						Header: ({ getToggleAllRowsSelectedProps }) => (
							<div className="headerCheckBox">
								<IndeterminateCheckbox
									{...getToggleAllRowsSelectedProps()}
								/>
							</div>
						),
						// The cell can use the individual row's getToggleRowSelectedProps method
						// to the render a checkbox
						Cell: ({ row }) => (
							<div className="checkboxDiv">
								<IndeterminateCheckbox
									{...row.getToggleRowSelectedProps()}
								/>
							</div>
						),
						// isVisible:false
					},
					...columns,
				]);
			}
		);

		// We don't want to render all of the rows for this example, so cap
		// it for this use case
		const firstPageRows = rows.slice(0, 30);
		const exportData = () => {
			console.log(selectedFlatRows);
			// setExportedData([...exportedData, selectedFlatRows])
			setExportedData((exportedData) => [
				...exportedData,
				...selectedFlatRows,
			]);
			// setGlobalFilter(null);
			// state.globalFilter = '';
			// console.log(state);
			// setTableVisible(!isTableVisible)
		};

		const ready4interventions = () => {
console.log("click")


if (dbECME) {
	// window.electron.ipcRenderer.insererDBinterventions(JSON.stringify(data[0]))
	console.log(exportedData)
	exportedData.forEach((element) => {
		let element4db={};
		console.log('dbECME.find');
		console.log(element.original.marquage);
		console.log(dbECME);

		const itemFromdbECME = dbECME.find(
			(e) => e.marquage == element.original.marquage
		);
		if (itemFromdbECME) {
			console.log('itemFromdbECME');
			console.log(itemFromdbECME);
			element.tag = itemFromdbECME.tag;
			element.operateur = itemFromdbECME.operateur;
		} else {
			// alert(element.original.marquage+ " n'a pas été renseigné")
		}
		element4db.original=element.original
		element4db.operateur=element.operateur
		element4db.tag=element.tag
		element4db.marquage=element.original.marquage
		element4db.isDocumentChecked=false
		element4db.isTransfertChecked=false
		element4db.isStickerChecked=false
		// newItems.push(element);
		newItems4db.push(element4db);
	});
	console.log(exportedData);
	// console.log(newItems);
	console.log(newItems4db);


	window.electron.ipcRenderer.insererDBinterventions(newItems4db)

	// setItemsList(newItems);

	// let operateurUnique = [
	// 	...new Set(dbECME.map((item) => item.operateur)),
	// ].sort();
	// let tagUnique = [...new Set(dbECME.map((item) => item.tag))].sort();
	// console.log(operateurUnique);
	// console.log(tagUnique);
	// setTagOperateurList({tagUnique,operateurUnique})
}













			// interventionsEncours(exportedData)
			// setTableVisible(!isTableVisible);
		};
		console.log('selectedFlatRows');
		console.log(selectedFlatRows);
		console.log('selectedRowIds');
		console.log(selectedRowIds);
		// majPanier(selectedFlatRows)
		// const majPanier =()=>{
		// 	console.log('selectedFlatRows')
		// 	setSelectedItems(selectedFlatRows)
		// }

		return (
			<>
				<div>
				<button className="buttonPanierIntervention" onClick={exportData}>Ajouter au panier </button>
				<Link to="/interventionsEnCours"   ><button className="buttonPanierIntervention" onClick={ready4interventions}>
					Valider le panier </button>
				</Link>
				</div>
				{/* <Link to="/interventionsEnCours"  className="LinkPanierIntervention" onClick={ready4interventions}>
					click to interventions
				</Link> */}
				{exportedData && (
					<div className="panierIntervention">
						{/* {console.log(exportedData)} */}
						{exportedData.map((e) => (
							<div>
								{e.original.marquage +
									' - ' +
									e.original.famille
									// +
									// ' - ' +
									// e.original.service4
									}
							</div>
						))}
					</div>
				)}
				<table {...getTableProps()}>
					<thead>
						{headerGroups.map((headerGroup) => (
							<tr {...headerGroup.getHeaderGroupProps()}>
								{headerGroup.headers.map((column) => (
									<th {...column.getHeaderProps()}>
										{column.render('Header')}
										{/* Render the columns filter UI */}
										<div>
											{column.canFilter
												? column.render('Filter')
												: null}
										</div>
									</th>
								))}
							</tr>
						))}
						<tr>
							<th
								colSpan={visibleColumns.length}
								style={{
									textAlign: 'left',
								}}
							>
								<GlobalFilter
									preGlobalFilteredRows={
										preGlobalFilteredRows
									}
									globalFilter={state.globalFilter}
									setGlobalFilter={setGlobalFilter}
								/>
							</th>
						</tr>
					</thead>
					<tbody {...getTableBodyProps()}>
						{firstPageRows.map((row, i) => {
							prepareRow(row);
							return (
								<tr {...row.getRowProps()}>
									{row.cells.map((cell) => {
										return (
											<td {...cell.getCellProps()}>
												{cell.render('Cell')}
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
				<br />
				<div>Showing the first 30 results of {rows.length} rows</div>
				<div>
					<pre>
						<code>{JSON.stringify(state.filters, null, 2)}</code>
					</pre>
					<p>Selected Rows: {Object.keys(selectedRowIds).length}</p>
					<p>Selected : {JSON.stringify(selectedRowIds)}</p>
					<pre>
						<code>
							{JSON.stringify(
								{
									selectedRowIds: selectedRowIds,
									'selectedFlatRows[].original':
										selectedFlatRows.map((d) => d.original),
								},
								null,
								2
							)}
						</code>
					</pre>
				</div>
			</>
		);
	}

	// Define a custom filter filter function!
	function filterGreaterThan(rows, id, filterValue) {
		return rows.filter((row) => {
			const rowValue = row.values[id];
			return rowValue >= filterValue;
		});
	}

	// This is an autoRemove method on the filter function that
	// when given the new filter value and returns true, the filter
	// will be automatically removed. Normally this is just an undefined
	// check, but here, we want to remove the filter if it's not a number
	filterGreaterThan.autoRemove = (val) => typeof val !== 'number';



	return (
		<div className="majData">
			{datas && isTableVisible && (
				<Table columns={columns} data={datas} />
			)}
			{datas && !isTableVisible && (
				<InterventionAtelier data={exportedData} />
			)}
		</div>
	);
};

export default RechercheDeca;
