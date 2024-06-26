//NOTE: Depending on the image that's being evaluated, on medium and small mobile, item boxes may be too large for viewing port
import { forwardRef, useState } from "react"
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Grid, IconButton, Paper, Stack, Typography, Toolbar, styled, Tooltip, CircularProgress } from "@mui/material"
import { languageMap } from "@/languageMap"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Document, Page } from "react-pdf";
import Image from "next/image";

const CustomToolbar = ({ toolbarName, copyToClipboard }) => (
  <Item>
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
  </Item>
)

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1a2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  margin: '5px',
  padding: '10px',
  maxHeight: '500px',
  maxWidth: '380px',
  overflow: 'hidden'
}))

const Results = forwardRef((props, ref) => {
  const { results, generatedUrl, openSnackbar, theme, viewportWidth } = props
  const [langExapanded, setLangExpanded] = useState(false)
  const [wordCountExapnded, setWordCountExpanded] = useState(false)

  const getFileTypePreview = () => {
    if (results?.file_type === 'application/pdf') {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            scale: '0.9'
          }}
        >
          <Document
            file={generatedUrl}
            loading={
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <CircularProgress />
              </Box>
            }
            error={'Failed to load PDF preview'}
          >
            <Page
              pageNumber={1}
              height={450}
            />
          </Document>
        </Box>
      )
    } else if (results?.file_type === 'image/png' || results?.file_type === 'image/jpeg') {
      return (
        <Image
          src={generatedUrl}
          alt='Evaluated Document Image'
          width={0}
          height={0}
          layout="responsive"
          style={{
            scale: '0.8'
          }}
        />
      )
    }
  }

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
      ref={ref}
      spacing={1}
    >
      {getFileTypePreview()}
      <Divider 
        sx={{
          maxWidth: '100%'
        }}
      />
      <Grid
        container
        sx={{ flexGrow: 1 }}
      >
        <Grid
          item
          xs={theme.resultGridScale ? 12 : 4}
        >
          <CustomToolbar
            toolbarName={'Analyzed Text'}
            copyToClipboard={() => copyToClipboard(results?.doc_text)}
          />
          <Item
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
            {results?.doc_text}
          </Item>
        </Grid>
        <Grid
          item
          xs={theme.resultGridScale ? 12 : 4}
        >
          <CustomToolbar
            toolbarName={'Document Summary'}
            copyToClipboard={() => copyToClipboard(results?.doc_summary)}
          />
          <Item
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
            {results?.doc_summary}
          </Item>
        </Grid>
        <Grid
          item
          xs={theme.resultGridScale ? 12 : 4}
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