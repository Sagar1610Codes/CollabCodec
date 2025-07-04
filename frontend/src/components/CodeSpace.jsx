import { useParams } from 'react-router-dom'
import EditorComponent from './Editor'

const CodeSpace = () => {
    const { projectId, '*': filePath } = useParams();

    return (
        <EditorComponent projectId={projectId} filePath={filePath} />
    )
}

export default CodeSpace
