import { BingoCard, BingoNumber, BingoPattern } from '../types';

const BINGO_RANGES: Record<number, { min: number; max: number }> = {
    0: { min: 1, max: 15 },  // B
    1: { min: 16, max: 30 }, // I
    2: { min: 31, max: 45 }, // N
    3: { min: 46, max: 60 }, // G
    4: { min: 61, max: 75 }, // O
};

function getRandomNumbersInRanges(count: number, min: number, max: number): number[] {
    const numbers = new Set<number>();
    while (numbers.size < count) {
        numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return Array.from(numbers);
}

export const generateBingoCard = (): BingoCard => {
    const card: BingoCard = [];
    for (let col = 0; col < 5; col++) {
        const columnNumbers = getRandomNumbersInRanges(5, BINGO_RANGES[col].min, BINGO_RANGES[col].max);
        const cardColumn: (BingoNumber | {value: 'FREE', marked: true})[] = [];
        for (let row = 0; row < 5; row++) {
             if (col === 2 && row === 2) {
                cardColumn.push({ value: 'FREE', marked: true });
            } else {
                cardColumn.push({ value: columnNumbers[row], marked: false });
            }
        }
        card.push(cardColumn);
    }
    // Transpose the card to have correct B-I-N-G-O columns
    const transposedCard: BingoCard = card[0].map((_, colIndex) => card.map(row => row[colIndex]));
    return transposedCard;
};

const isMarked = (cell: BingoNumber | { value: 'FREE', marked: true }, calledNumbers: number[]): boolean => {
    if (cell.value === 'FREE') return true;
    return calledNumbers.includes(cell.value);
}

export const checkBingoWinner = (card: BingoCard, calledNumbers: number[], pattern: BingoPattern): boolean => {
    
    switch (pattern) {
        case BingoPattern.ANY_LINE: {
            // Check rows
            for (let i = 0; i < 5; i++) {
                if (card[i].every(cell => isMarked(cell, calledNumbers))) return true;
            }
            // Check columns
            for (let j = 0; j < 5; j++) {
                if (card.every(row => isMarked(row[j], calledNumbers))) return true;
            }
            // Check diagonals
            const diag1 = [card[0][0], card[1][1], card[2][2], card[3][3], card[4][4]];
            if (diag1.every(cell => isMarked(cell, calledNumbers))) return true;
            const diag2 = [card[0][4], card[1][3], card[2][2], card[3][1], card[4][0]];
            if (diag2.every(cell => isMarked(cell, calledNumbers))) return true;
            
            return false;
        }

        case BingoPattern.FOUR_CORNERS: {
            const corners = [card[0][0], card[0][4], card[4][0], card[4][4]];
            return corners.every(cell => isMarked(cell, calledNumbers));
        }
        
        case BingoPattern.CROSS: {
            const middleRow = card[2];
            const middleColumn = card.map(row => row[2]);
            // Every cell in the middle row and middle column must be marked.
            const patternCells = [...new Set([...middleRow, ...middleColumn])];
            return patternCells.every(cell => isMarked(cell, calledNumbers));
        }
        
        case BingoPattern.LETTER_X: {
            const diag1 = [card[0][0], card[1][1], card[2][2], card[3][3], card[4][4]];
            const diag2 = [card[0][4], card[1][3], card[2][2], card[3][1], card[4][0]];
            return diag1.every(cell => isMarked(cell, calledNumbers)) && diag2.every(cell => isMarked(cell, calledNumbers));
        }

        case BingoPattern.SMALL_SQUARE: {
            // Top-left 2x2 square
            const square = [card[0][0], card[0][1], card[1][0], card[1][1]];
            return square.every(cell => isMarked(cell, calledNumbers));
        }

        case BingoPattern.TOP_ROW: {
            return card[0].every(cell => isMarked(cell, calledNumbers));
        }

        case BingoPattern.MIDDLE_ROW: {
            return card[2].every(cell => isMarked(cell, calledNumbers));
        }

        case BingoPattern.BOTTOM_ROW: {
            return card[4].every(cell => isMarked(cell, calledNumbers));
        }

        case BingoPattern.LEFT_L: {
            const leftColumn = card.map(row => row[0]);
            const bottomRow = card[4];
            const patternCells = [...new Set([...leftColumn, ...bottomRow])];
            return patternCells.every(cell => isMarked(cell, calledNumbers));
        }

        case BingoPattern.RIGHT_L: {
            const rightColumn = card.map(row => row[4]);
            const topRow = card[0];
            const patternCells = [...new Set([...rightColumn, ...topRow])];
            return patternCells.every(cell => isMarked(cell, calledNumbers));
        }

        case BingoPattern.FULL_HOUSE: {
            return card.flat().every(cell => isMarked(cell, calledNumbers));
        }

        default:
            return false;
    }
};

