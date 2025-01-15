import styled from "styled-components"
import {TableCell, TableContainer, TableRow, Tab, Select, Button, Chip} from "@mui/material";
import {NavLink, NavLinkProps} from "react-router-dom";

export const AppContainer = styled.div`
  align-items: flex-start;
  background-color: #101010;
  background-size: cover;
  display: flex;
  flex-direction: row;
  height: auto;
  min-height: 100%;
  padding: 20px;
  width: 100%;
`

type DragPreviewContainerProps = {
  isHidden?: boolean
  isPreview?: boolean
}

interface StyledLinkProps extends NavLinkProps {
  color?: string; // Optional override for color
  isActive?: boolean; // This might be redundant if you rely on NavLink's active behavior
}

export const DragPreviewContainer = styled.div<DragPreviewContainerProps>`
  transform: ${(props) =>
    props.isPreview ? "rotate(5deg)" : undefined};
  opacity: ${(props) => (props.isHidden ? 0 : 1)};
`

type DragPreviewWrapperProps = {
  position: {
    x: number
    y: number
  }
}

export const DragPreviewWrapper = styled.div.attrs<DragPreviewWrapperProps>(
  ({ position: { x, y } }) => ({
    style: {
      transform: `translate(${x}px, ${y}px)`
    }
  })
)<DragPreviewWrapperProps>``

type ColumnContainerProps = {
  isPriceSet?: boolean
}

export const ColumnContainer = styled(DragPreviewContainer)<ColumnContainerProps>`
  background-color: #ebecf0;

  width: 300px;
  min-height: 40px;
  margin: 10px auto;
  border-radius: 3px;
  padding: 8px 8px;
  flex-grow: 0;
  flex-shrink: 0;
    
`

export const ColumnTitle = styled.div`
  padding: 6px 16px 12px;
  font-weight: bold;
display: flex;
justify-content: space-between;
align-items: center;
`

export const DeleteTaskButton = styled.button`
  display: none;
  transition: 0.3s;
  border: none;
  color: red;
  font-size: 12px;
  padding: 4px 15px;
cursor: pointer;
`
export const EditTaskButton = styled.button`
  display: none;
  transition: 0.3s;
  border: none;
  color: orange;
  font-size: 12px;
  padding: 4px 15px;
cursor: pointer;
`

export const CardContainer = styled(DragPreviewContainer)<ColumnContainerProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => (props.isPriceSet ? "#fff" : "#ffc9c9")};;
  cursor: pointer;
  margin-bottom: 0.5rem;
  padding: 0.5rem 1rem;
  max-width: 300px;
  border-radius: 3px;
  box-shadow: #091e4240 0px 1px 0px 0px;
  &:hover ${DeleteTaskButton}, &:hover ${EditTaskButton} {
        display: block;
    }
`

type AddItemButtonProps = {
  dark?: boolean
  excel?: boolean
}

export const AddItemButton = styled.button<AddItemButtonProps>`
  background-color: ${(props) => (props.excel ? "#47c35180" : "#0000003d")};
  border-radius: 3px;
  border: none;
  color: ${(props) => (props.dark ? "#000" : "#FFA500")};
  cursor: pointer;
  padding: 10px 12px;
  text-align: left;
  margin: 10px;
  height: 35px;
  transition: background 85ms ease-in;
  width: 200px;
  &:hover {
    color: ${(props) => (props.excel ? "#47c35180" : "#FFA500")};
    background-color: #0000009d;
  }
`

export const NewItemFormContainer = styled.div`
  max-width: 400px;
  margin: 10px;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
`

export const NewItemInput = styled.input`
  background: #00000060;
  border-radius: 3px;
  color: #fff;
  border: none;
  box-shadow: #000 0px 1px 0px 0px;
  margin-bottom: 0.5rem;
  padding: 0.5rem 1rem;
  width: clamp(180px,100%, 600px);
  &:focus {
    outline: none;
    border: none;
    backdrop-filter: brightness(1.15)
  }
`

export const NewItemButton = styled.button`
  background-color: #5aac44;
  border-radius: 3px;
  border: none;
  box-shadow: none;
  color: #fff;
  padding: 6px 12px;
  text-align: center;
  width: 100%;
  margin: 10px 0;
  
  &:hover {
    cursor: pointer;
  }

   &:disabled {
    background-color: #cccccc; // Lighter color indicating it's disabled
    color: #666666; // Dimmed text color
    cursor: not-allowed; // Change cursor to indicate the button is disabled
    box-shadow: none; // Optional: remove or modify the box shadow if any
  }
`

export const CustomDragLayerContainer = styled.div`
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: auto
  z-index: 100;
`
export const StyledTableContainer = styled(TableContainer)`
  border-radius: 10px;
  background-color: #ffffff05;
  border: 1px solid #FFA50055;
  box-shadow: 8px 12px 15px -10px rgba(0, 0, 0, 0.2);
  width: 100%;
`
export const StyledTableRow = styled(TableRow)`
  padding: 4px 16px;
  //background-color: ${(props) => props.color || 'white'};
`

export const StyledTableCell = styled(TableCell)`
  padding: 4px 16px !important;
  @media (max-width: 1280px) {  
    font-size: 0.725rem;
  }

`

export const SyledListButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #ffffff;
  &:hover{
    text-decoration: underline;
  }
`

export const Status = styled.span`
    display: inline-block;
  margin-right: 0.6rem;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${(props) => props.color || 'grey'};
`;

export const StyledNavBar = styled.div`
  height: 40px;
  width: auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin: 10px auto;
  padding: 10px 20px;
  background-color: #ffffff09;
  border-radius: 10px;
  backdrop-filter: blur(50px);
`

export const StyledTab = styled(Tab)`
  color: salmon !important;
`

export const StyledNavBarItem = styled.div`
  color: #ffffff;
  margin: 0 6px;
  & > * {
    color: #ffffff;
    
    
  }
`
export const StyledLink = styled(NavLink)<StyledLinkProps>`
    text-decoration: none;
    color: ${(props) => props.color || '#ffffff'};
    text-decoration: ${(props) => props.isActive  ? 'underline orange' : 'none'};
    &:hover {
      color: orange;
    }
    &.active {
      text-decoration: underline orange;
    }
    @media (max-width: 600px) {  
      font-size: 1.725rem;
    }
`;

export const StyledSelect = styled(Select)`
color: #ffffff !important;
    & > * {
      color: #ffffff !important;
    }

`

export const StyledSelectDark = styled(Select)`
color: #ffffff !important;
margin: 0 auto !important;
width: 150px !important;
background-color: #00000000;
    & > * {
      color: #ffffff !important;
    }

`
export const StyledGenerateButton = styled(Button)`
    color: orange !important;
    background-color: rgba(0, 0, 0, 0.16) !important;
    width: 120px;
    height: 48px;
    margin-left: 10px;
    &:hover {
      background-color: rgba(0, 0, 0, 0.26) !important;
    }
  
`

export const StyledGenerateCashOrderButton = styled.button`
position: absolute;
bottom: 5%;
left: 5%;
border: none;
transition: all 0.3s;
background: transparent;
color: orange;
padding: 0;
&:hover {
  border-bottom: 1px solid orange;
  cursor: pointer;
}
` 

export const StyledChip = styled(Chip)`
position: absolute;
top: 20%;
`