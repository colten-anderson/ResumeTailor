import { useState } from 'react'
import JobDescriptionInput from '../JobDescriptionInput'

export default function JobDescriptionInputExample() {
  const [value, setValue] = useState('');
  
  return <JobDescriptionInput value={value} onChange={setValue} />
}
