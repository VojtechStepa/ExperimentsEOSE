import {Mosaic, MosaicWindow} from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';

export function App() {
    return (
        <div style={{height: '100vh'}}>
            <Mosaic<string>
                renderTile={(id, path) => (
                    <MosaicWindow<string> path={path} title={`Panel ${id}`}>
                        <div style={{padding: 20}}>Contents of {id}</div>
                    </MosaicWindow>
                )}
                initialValue={{
                    type: 'split',
                    direction: 'row',
                    children: ['A', 'B'],
                }}
            />
        </div>
    );
}

export default App
