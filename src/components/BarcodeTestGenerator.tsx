import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Download } from 'lucide-react';

/**
 * Calculate EAN-13 check digit
 */
const calculateEAN13CheckDigit = (digits: string): number => {
	if (digits.length !== 12) return 0;
	
	let sum = 0;
	for (let i = 0; i < 12; i++) {
		const digit = parseInt(digits[i], 10);
		sum += (i % 2 === 0) ? digit : digit * 3;
	}
	
	const remainder = sum % 10;
	return remainder === 0 ? 0 : 10 - remainder;
};

/**
 * Generate valid EAN-13 barcode
 */
const generateValidEAN13 = (base: string = '400638133393'): string => {
	const baseDigits = base.padStart(12, '0').slice(0, 12);
	const checkDigit = calculateEAN13CheckDigit(baseDigits);
	return baseDigits + checkDigit;
};

/**
 * Normalize to a valid EAN-13 (padding + check digit) for barcode image generation
 */
const fixEANCheckDigit = (ean: string): string => {
	let baseDigits: string;
	if (ean.length === 13) {
		// Remove the last digit (check digit) and recalculate
		baseDigits = ean.slice(0, 12);
	} else if (ean.length < 12) {
		// Pad to 12 digits
		baseDigits = ean.padStart(12, '0');
	} else {
		// Already 12 digits
		baseDigits = ean;
	}
	const checkDigit = calculateEAN13CheckDigit(baseDigits);
	return baseDigits + checkDigit;
};

const BarcodeTestGenerator: React.FC = () => {
	const [ean13, setEan13] = useState<string>(() => generateValidEAN13('000000000000'));
	const [customBase, setCustomBase] = useState<string>('000000000000');
	const [barcodeUrl, setBarcodeUrl] = useState<string>('');
	/** Last pasted / entered code before normalization (for display only) */
	const [rawInputEan, setRawInputEan] = useState<string>('');
	const rawEanInputRef = useRef<HTMLInputElement>(null);

	const handleGenerate = () => {
		const validEAN = generateValidEAN13(customBase);
		setRawInputEan('');
		setEan13(validEAN);
	};

	const handleApplyRawTestEan = () => {
		const raw = rawEanInputRef.current?.value ?? '';
		const trimmed = raw.trim();
		if (!trimmed) return;
		const digitsOnly = trimmed.replace(/\D/g, '');
		if (!digitsOnly) return;
		setRawInputEan(trimmed);
		setEan13(fixEANCheckDigit(digitsOnly));
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(ean13);
	};

	const handleDownload = () => {
		if (!barcodeUrl) return;
		const link = document.createElement('a');
		link.href = barcodeUrl;
		link.download = `barcode-${ean13}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	React.useEffect(() => {
		if (ean13 && ean13.length === 13) {
			const url = `https://barcode.tec-it.com/barcode.ashx?data=${ean13}&code=EAN13&dpi=300&scale=3`;
			setBarcodeUrl(url);
		}
	}, [ean13]);

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>EAN-13 Barcode Test Generator</CardTitle>
				<CardDescription>
					Generate a valid EAN-13 barcode for testing the scanner
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="ean13">EAN Code (corrected for barcode generation)</Label>
					<div className="flex gap-2">
						<Input
							id="ean13"
							value={ean13}
							readOnly
							className="font-mono"
						/>
						<Button variant="outline" size="icon" onClick={handleCopy}>
							<Copy className="h-4 w-4" />
						</Button>
					</div>
					{rawInputEan.trim() !== '' && (
						<p className="text-xs text-muted-foreground rounded bg-muted/50 p-2">
							From <span className="font-mono">{rawInputEan}</span> → EAN-13 used for image:{' '}
							<span className="font-mono">{ean13}</span>
						</p>
					)}
					<p className="text-xs text-muted-foreground">
						The displayed code uses a valid EAN-13 check digit for image generation. Product lookup in the app may use the code from your catalog as stored.
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="raw-ean">Paste a code to test (any length; padded / check digit corrected)</Label>
					<div className="flex gap-2">
						<Input
							ref={rawEanInputRef}
							id="raw-ean"
							placeholder="e.g. from product file or scanner"
							className="font-mono"
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleApplyRawTestEan();
							}}
						/>
						<Button type="button" variant="secondary" onClick={handleApplyRawTestEan}>
							Apply
						</Button>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="customBase">Custom Base (12 digits, check digit auto-calculated)</Label>
					<div className="flex gap-2">
						<Input
							id="customBase"
							value={customBase}
							onChange={(e) => {
								const value = e.target.value.replace(/\D/g, '').slice(0, 12);
								setCustomBase(value);
							}}
							placeholder="400638133393"
							className="font-mono"
						/>
						<Button onClick={handleGenerate}>Generate</Button>
					</div>
				</div>

				{barcodeUrl && (
					<div className="space-y-2">
						<Label>Barcode Image</Label>
						<div className="border rounded-lg p-4 bg-white flex flex-col items-center gap-4">
							<img
								src={barcodeUrl}
								alt={`EAN-13 Barcode: ${ean13}`}
								className="max-w-full h-auto"
								onError={(e) => {
									console.error('Failed to load barcode image');
									e.currentTarget.style.display = 'none';
								}}
							/>
							<div className="flex gap-2">
								<Button variant="outline" onClick={handleDownload}>
									<Download className="h-4 w-4 mr-2" />
									Download
								</Button>
								<Button variant="outline" onClick={() => window.open(barcodeUrl, '_blank')}>
									Open in New Tab
								</Button>
							</div>
						</div>
					</div>
				)}

				<div className="text-sm text-muted-foreground space-y-1">
					<p className="font-medium">Usage:</p>
					<ol className="list-decimal list-inside space-y-1 ml-2">
						<li>Generate or use the default EAN-13 code</li>
						<li>Download or open the barcode image</li>
						<li>Display it on another screen or print it</li>
						<li>Scan it with the barcode scanner in the incident form</li>
					</ol>
				</div>
			</CardContent>
		</Card>
	);
};

export default BarcodeTestGenerator;

