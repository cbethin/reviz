import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [filenames, setFileNames] = useState<string[]>([])
  const [stories, setStories] = useState<string[]>([])
  
  useEffect(() => {
    fetch('/image-list', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        setFileNames(data.files)
        setStories(data.stories)
      })
  }, [])
  
  return (
    <div className="App">
      <h3>Stories</h3>
      {
        stories.length === 0 &&
        <p>No stories to review.</p>
      }
      {
        filenames.map(filename => (
          <>
            <p>{stories.find(story => filename.includes(story))}</p>
            <img src={`/images/${filename}`} style={{ width: '40%' }} alt='Diff image' />
          </>
        ))
      }
    </div>
  );
}

export default App;