import {Group, Panel, Separator} from 'react-resizable-panels';
import './App.css';

export function App() {
    return (
        <Group orientation="horizontal" style={{height: '100dvh'}}>
            <Panel minSize={15}>Left</Panel>
            <Separator className="resize-handle is-horizontal" />
            <Panel minSize={15}>Right</Panel>
        </Group>
    );
}
export default App
