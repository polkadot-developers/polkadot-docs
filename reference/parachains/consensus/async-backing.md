---
title: Asynchronous Backing
description: Understand how asynchronous backing pipelines parachain block production, the protocol changes it introduces on the Relay Chain, and how parachains participate safely and efficiently.
categories: Polkadot Protocol
---

# Asynchronous Backing

## Introduction

Asynchronous backing often shortened to _Async Backing_ is a parachain protocol feature that significantly improves performance, enabling parachains to produce blocks twice as fast (every 6 seconds instead of every 12) and to provide 4x more execution time per block (2 seconds instead of 0.5). 

Technically, async backing is a parachain [configuration](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/relay_chain/struct.AsyncBackingParams.html){target=\_blank} that allows collators and validators to build blocks ahead of the relay chain during the generation and backing stages of the [Inclusion Pipeline](/reference/parachains/consensus/inclusion-pipeline){target=\_blank} by using unincluded segments, which are chains of parachain blocks that have not yet been fully included in the relay chain. This decouples parachain block production from relay chain inclusion, improves coretime efficiency, and enables the parallel processing required for parachains to further scale throughput using [Elastic Scaling](/reference/parachains/consensus/elastic-scaling){target=\_blank}.

## Configurations
The following configurations can be set by on-chain governance, dictating how many blocks ahead of the relay chain a given parachain's collators can run:

- [**`max_candidate_depth`**](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/relay_chain/struct.AsyncBackingParams.html#structfield.max_candidate_depth){target=\_blank}: the number of parablocks a collator can produce that are not yet included in the relay chain. A value of `2` means that there can be a maximum of 3 unincluded parablocks at any given time.
- [**`allowed_ancestry_len`**](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/relay_chain/struct.AsyncBackingParams.html#structfield.allowed_ancestry_len){target=\_blank}: the oldest relay parent a parablock can be built on top of. A value of `1` means collators can start building blocks 6 seconds in advance.

## Synchronous VS. Asynchronous Processing

The Polkadot-parachain protocol originally operated in synchronous mode, where both collators and validators drew context exclusively from the relay parent of the prior parablock, which lives on the relay chain. This made the Backing and Generation steps tightly coupled to the prior parablock completing the entire inclusion pipeline. As a result, one parablock could only be processed every other relay block, with just 0.5 seconds assigned for execution.

```mermaid
---
    displayMode: compact
    config:
        themeCSS: "
            #item1 { fill: #450693; stroke: #450693; } \n
            #item2 { fill: #8C00FF; stroke: #8C00FF; } \n
            #item3 { fill: #FFC400; stroke: #FFC400; } \n
            #r     { fill: #eb4172; stroke:none; font-size: 20px; } \n
            svg text { font-size: 20px !important; } \n
            svg .sectionTitle { font-size: 20px !important; } \n    #p1padTop { display: none; } \n

            /* Hide ALL task labels by default */
            text.taskText,
            text.taskTextOutside,
            [class*='taskText'] tspan { display: none !important; } \n

            /* Show labels for the 'r' group (inside or outside, incl. tspans) */
            text.taskText[id^='r'],
            text.taskTextOutside[id^='r'],
            text[id^='r'] tspan { display: inline !important; font-size: 20px; fill: var(--white) !important; } \n

            /* Keep section titles styled */
            .sectionTitle { fill: var(--md-default-fg-color) !important; font-weight: 700; font-size: 18px; } \n

            /* Hide the first two section titles (F1, F2). Change indexes if needed. */
            .sectionTitle:nth-of-type(1),
            .sectionTitle:nth-of-type(2) { display: none !important; } \n

            /* Also hide SPACING row labels on the left */
            text.taskTextOutside[id^='p1padTop'] { display: none !important; } \n

            .grid .tick text { fill: var(--md-default-fg-color) !important; font-size: 20px !important; }

        "
        themeVariables:
            sectionBkgColor: '#fff'
        gantt:
            numberSectionStyles: 1
            barHeight: 70
            gridLineStartPadding: 100
---
%%{init: {"gantt": {"barHeight": 70 }}}%%
gantt
    dateFormat YYYY
    axisFormat %y
    tickInterval '10year'

    section F1
    R1 : r, 1905, 1907
    R2 : r, 1911, 1913
    R3 : r, 1917, 1919
    R4 : r, 1923, 1925

    section F2
    SPACING : p1padTop, 1901, 1924

    section P1
    X          : item1, 1900, 1901
    Backing    : item2, 1901, 1906
    Inclusion  : item3, 1906, 1912

    section P2
    X          : item1, 1912, 1913
    Backing    : item2, 1913, 1918
    Inclusion  : item3, 1918, 1924
    

```

The modern protocol now uses asynchronous backing, where both collators and validators have access to [unincluded segments](/reference/parachains/consensus/inclusion-pipeline){target=\_blank} as an additional context source. The Backing and Generation steps are no longer coupled to the prior block completing the full inclusion pipeline. Instead, the prior parablock only needs to complete the generation step and be added to the Unincluded Segments before the next parablock can begin the Backing and Generation steps.

This results in one parablock being processed every relay block (instead of every other relay block), and allows for more time to execute during the Generation step (0.5s → 2s).

```mermaid
---
    displayMode: compact
    config:
        themeCSS: "
            #item1 { fill: #450693; stroke: #450693; } \n
            #item2 { fill: #8C00FF; stroke: #8C00FF; } \n
            #item3 { fill: #FFC400; stroke: #FFC400; } \n
            #r     { fill: #eb4172; stroke:none; font-size: 20px; } \n
            svg text { font-size: 20px !important; } \n
            svg .sectionTitle { font-size: 20px !important; } \n    #p1padTop { display: none; } \n

            /* Hide ALL task labels by default */
            text.taskText,
            text.taskTextOutside,
            [class*='taskText'] tspan { display: none !important; } \n

            /* Show labels for the 'r' group (inside or outside, incl. tspans) */
            text.taskText[id^='r'],
            text.taskTextOutside[id^='r'],
            text[id^='r'] tspan { display: inline !important; font-size: 20px; color: var(--white) !important; } \n

            /* Keep section titles styled */
            .sectionTitle { fill: var(--md-default-fg-color) !important; font-weight: 700; font-size: 18px; } \n

            /* Hide the first two section titles (F1, F2). Change indexes if needed. */
            .sectionTitle:nth-of-type(1),
            .sectionTitle:nth-of-type(2) { display: none !important; } \n

            /* Also hide SPACING row labels on the left */
            text.taskTextOutside[id^='p1padTop'] { display: none !important; } \n

            .taskTextOutsideRight { fill: var(--md-default-fg-color) !important; font-size: 20px !important; }

            .grid .tick text { fill: var(--md-default-fg-color) !important; font-size: 20px !important; }
        "
        themeVariables:
            sectionBkgColor: '#fff'
        gantt:
            numberSectionStyles: 1
            barHeight: 70
            gridLineStartPadding: 100
---
%%{init: {"gantt": {"barHeight": 70 }}}%%
gantt
    dateFormat YYYY
    axisFormat %y
    tickInterval '10year'

    section F1
    R1 : r, 1905, 1907
    R2 : r, 1911, 1913
    R3 : r, 1917, 1919
    R4 : r, 1923, 1925
    R5 : r, 1929, 1931

    section F2
    SPACING : p1padTop, 1901, 1930

    section P1
    X         : item1, 1900, 1902
    Backing   : item2, 1902, 1912
    Inclusion : item3, 1912, 1918

    section P2
    X         : item1, 1906, 1908
    Backing   : item2, 1908, 1918
    Inclusion : item3, 1918, 1924
    
    section P3
    X         : item1, 1912, 1914
    Backing   : item2, 1914, 1924f
    Inclusion : item3, 1924, 1930

    section P4
    X         : item1, 1918, 1920
    Backing   : item2, 1920, 1930
```