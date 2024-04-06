//TODO: Clicking on the block with the doc text or the doc summary, opens a modal (or something) so it's easier to read for end user to digest
//TODO: If document is a PDF, then it's displayed as a PDF displayer. (PNG/JPG/JPEG need to be smaller)
import { forwardRef, useState } from "react"
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Grid, IconButton, Paper, Stack, Typography, Toolbar, styled, Tooltip } from "@mui/material"
import Image from "next/image"
import { languageMap } from "@/languageMap"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const CustomToolbar = ({ toolbarName, copyToClipboard }) => (
  <Toolbar
    disableGutters
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      '&.MuiToolbar-root': {
        minHeight: '0px'
      }
    }}
  >
    <Typography>
      {toolbarName}
    </Typography>
    <Tooltip
      title={'Copy Text'}
    >
      <IconButton
        onClick={copyToClipboard}
      >
        <ContentCopyIcon />
      </IconButton>
    </Tooltip>
  </Toolbar>
)

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1a2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  margin: '5px',
  padding: '10px'
}))

const Results = forwardRef((props, ref) => {
  const { results, viewportWidth, openSnackbar } = props
  const [langExapanded, setLangExpanded] = useState(false)
  const [wordCountExapnded, setWordCountExpanded] = useState(false)

  const getLangName = (langCode) => {
    if (languageMap.hasOwnProperty(langCode)) {
      return languageMap[langCode]
    } else {
      return 'Unknown'
    }
  }

  const handleExpandChange = (accordion) => {
    if (accordion === 'lang') {
      setLangExpanded((prev) => !prev)
      setWordCountExpanded(false)
    }
    if (accordion === 'wordCount') {
      setLangExpanded(false)
      setWordCountExpanded((prev) => !prev)
    }
  }

  const getValue = (value) => {
    return (value * 100).toFixed(2)
  }

  const copyToClipboard = (text) => {
    openSnackbar({ message: 'Copied to clipboard', severity: 'success' })
    navigator.clipboard.writeText(text)
  }

  return (
    <Stack
      spacing={1}
      ref={ref}
    >
      <Box>
        <Item>
          <Image
            src={results?.doc_image || ''}
            alt='Analyzed Document'
          />
        </Item>
      </Box>
      <Divider />
      <Grid
        container
        sx={{ flexGrow: 1 }}
      >
        <Grid
          item
          xs={viewportWidth <= 425 ? 12 : 4}
        >
          <Item>
            <CustomToolbar
              toolbarName={'Analyzed Text'}
              copyToClipboard={() => copyToClipboard(results?.doc_text)}
            />
            {results?.doc_text}
          </Item>
        </Grid>
        <Grid
          item
          xs={viewportWidth <= 425 ? 12 : 4}
        >
          <Item>
            <CustomToolbar
              toolbarName={'Document Summary'}
              copyToClipboard={() => copyToClipboard(results?.doc_summary)}
            />
            {results?.doc_summary}
          </Item>
        </Grid>
        <Grid
          item
          xs={viewportWidth <= 425 ? 12 : 4}
        >
          <Item>
            <Stack
              spacing={1}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <Typography>
                  Image Quality Score
                </Typography>
                <Typography>
                  {`${getValue(results?.quality_score)}%`}
                </Typography>
              </Box>
              <Divider />
              <Accordion
                expanded={langExapanded}
                onChange={() => handleExpandChange('lang')}
                sx={{
                  maxHeight: '200px',
                  overflowY: 'scroll',
                  '&::-webkit-scrollbar': {
                    width: '5px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    borderRadius: '8px',
                    minHeight: '24px',
                    backgroundColor: 'transparent'
                  },
                  '&:hover::-webkit-scrollbar-thumb': {
                    backgroundColor: '#b7b7b7'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                >
                  <Typography>
                    Detected Languages
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {results?.detected_languages.map((lang) => (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                      key={`${lang.languageCode}`}
                    >
                      <Typography>
                        {getLangName(lang.languageCode)}
                      </Typography>
                      <Typography>
                        {`${getValue(lang.confidence)}%`}
                      </Typography>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
              <Divider />
              <Accordion
                expanded={wordCountExapnded}
                onChange={() => handleExpandChange('wordCount')}
                sx={{
                  maxHeight: '200px',
                  overflowY: 'scroll',
                  '&::-webkit-scrollbar': {
                    width: '5px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    borderRadius: '8px',
                    minHeight: '24px',
                    backgroundColor: 'transparent'
                  },
                  '&:hover::-webkit-scrollbar-thumb': {
                    backgroundColor: '#b7b7b7'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                >
                  <Typography>
                    Word Prevalence
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {results && Object.entries(results?.word_counts).map(([key, value]) => (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                      key={`word-count-${key}`}
                    >
                      <Typography>
                        {key}
                      </Typography>
                      <Typography>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Stack>
          </Item>
        </Grid>
      </Grid>
    </Stack>
  )
})

export default Results