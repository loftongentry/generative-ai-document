//TODO: This is where the results will appears after being returned from the 'getData' api route
//TODO: Tooltips explaining what each of the items is
//TODO: Clicking on the block with the doc text or the doc summary, opens a modal (or something) so it's easier to read for end user to digest
//TODO: Button to click and copy data to clipboard in the respective components (doc text, doc summary)
//TODO: If document is a PDF, then it's displayed as a PDF displayer
//TODO: Stylizing each of the boxes below as well as the image displayed. (PNG/JPG/JPEG need to be smaller)
//TODO: If just one page, show results for that one page, if multiple pages, show first page as cumulative results, than can filter down per page, etc.
import { forwardRef, useState } from "react"
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Grid, Stack, Typography, useTheme } from "@mui/material"
import Image from "next/image"
import { TestResult } from '../test/TestResult'
import { languageMap } from "@/languageMap"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Results = forwardRef((props, ref) => {
  const { results, setResults, viewportWidth } = props
  const theme = useTheme()
  const [sliderValues, setSliderValues] = useState(
    TestResult.doc_analysis.pages.map(page => ({
      qualityScore: page.quality_score * 100,
      detectedLanguages: page.detected_languages.map(lang => parseFloat((lang.confidence * 100).toFixed(2)))
    }))
  )
  const [expanded, setExpanded] = useState(null)

  const getLangName = (langCode) => {
    if (languageMap.hasOwnProperty(langCode)) {
      return languageMap[langCode]
    } else {
      return 'Unknown'
    }
  }

  const handleExpandChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  return (
    <Stack
      spacing={1}
    //ref={ref}
    >
      <Box>
        <Image
          src={TestResult.doc_analysis.doc_image}
          alt='Analyzed Document'
        />
      </Box>
      <Divider />
      <Grid
        container
        spacing={1}
      >
        <Grid item xs={4}>
          {TestResult.doc_analysis.doc_text}
        </Grid>
        <Grid item xs={4}>
          {TestResult.doc_analysis.doc_summary}
        </Grid>
        <Grid item xs={4}>
          <Stack
            spacing={1}
          >
            {TestResult.doc_analysis.pages.map((page, pageIndex) => (
              <Stack
                spacing={1}
                key={`${page}-${pageIndex}`}
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
                    {`${sliderValues[pageIndex].qualityScore}%`}
                  </Typography>
                </Box>
                <Divider />
                <Accordion
                  expanded={expanded === `panel${pageIndex}`}
                  onChange={handleExpandChange(`panel${pageIndex}`)}                  
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
                    {page.detected_languages.map((lang, langIndex) => (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                        key={`${lang}-${langIndex}`}
                      >
                        <Typography>
                          {getLangName(lang.languageCode)}
                        </Typography>
                        <Typography>
                          {`${sliderValues[pageIndex].detectedLanguages[langIndex]}%`}
                        </Typography>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </Stack>
            ))}
            <Divider />
            <Accordion
              expanded={expanded === 'wordPrevalence'}
              onChange={handleExpandChange('wordPrevalence')}
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
                {Object.entries(TestResult.doc_analysis.word_counts).map(([key, value]) => (
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
        </Grid>
      </Grid>
    </Stack>
  )
})

export default Results