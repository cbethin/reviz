import React, { useState } from 'react';
import styled from 'styled-components';
import useStories from './hooks/useStories';

const GridContainer = styled.div`
  display: grid;
  grid-template-areas: 
    'header header header'
    'sidebar content content';
  grid-template-rows: 50px auto;
  grid-template-columns: 200px 1fr;
  height: 100vh;

  @media (max-width: 768px) {
    grid-template-areas: 
      'header header header'
      'content content content';
    grid-template-columns: 1fr;
  }
`;

const Header = styled.header`
  grid-area: header;
  background-color: #ececec;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Sidebar = styled.div`
  padding: 12px;
  grid-area: sidebar;
  background-color: #ddd;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MainContent = styled.div`
  padding: 12px;
  grid-area: content;
  background-color: #bbb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SideBarItem = styled.p<{ selected?: boolean; selectable?: boolean }>`
  margin: 0px 0px 4px;
  padding: 10px;
  border-radius: 12px;
  text-wrap: wrap;
  word-wrap: break-word;
  max-width: 100%;

  ${({ selected }) => selected && 'backdrop-filter: brightness(92.5%);'}
  
  ${({ selectable }) => selectable && `
    &:hover {
      backdrop-filter: brightness(90%);
      cursor: pointer;
    }
  `}
`

const StyledImage = styled.img`
  max-width: 100%;
  max-height: calc(100vh - 150px);
  object-fit: contain;
`;

const App = () => {
  const { stories, utils: storyUtils } = useStories()
  const [selectedStory, selectStory] = useState('')

  const selectedStoryImage = storyUtils.getImageUrl(selectedStory)

  return (
    <GridContainer>
      <Header>Reviz</Header>
      <Sidebar>
        <SideBarItem
          style={{ fontSize: '1.25rem', fontWeight: '700' }}
        >
          Changed Components
        </SideBarItem>
        {
          stories && Object.keys(stories.files).map(
            story => 
              <SideBarItem 
                selected={selectedStory === story}
                selectable
                onClick={() => selectStory(story)}
              >
                {story}
              </SideBarItem>
          )
        }
      </Sidebar>
      <MainContent>
        {
          !selectedStory && 'Select a story to see the changes'
        }
        {
          storyUtils.isMissingOnThisBranch(selectedStory) && '*Missing*'
        }
        {
          storyUtils.isNewOnThisBranch(selectedStory) && '*New*'
        }
        {
          selectedStoryImage &&
          <StyledImage src={`/images/${selectedStoryImage}`} />
        }
      </MainContent>
    </GridContainer>
  )
}

export default App;
