import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private openaiApiKey: string;
  private openaiBaseUrl = 'https://api.openai.com/v1';

  constructor(private configService: ConfigService) {
    this.openaiApiKey = this.configService.get('OPENAI_API_KEY') || '';
  }

  async extractInvoiceData(imageUrl: string): Promise<any> {
    if (!this.openaiApiKey) {
      // Mock response for development without API key
      return this.getMockInvoiceData();
    }

    try {
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyse cette facture et extrais les informations suivantes au format JSON: numero de facture, date, nom du fournisseur, montant total, devise, date d\'échéance, description des articles. Retourne uniquement le JSON.',
                },
                {
                  type: 'image_url',
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
          max_tokens: 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
        },
      );

      const content = response.data.choices[0].message.content;
      const extractedData = JSON.parse(content);

      return {
        invoiceNumber: extractedData.numero_de_facture || extractedData.invoice_number,
        date: extractedData.date,
        supplierName: extractedData.nom_du_fournisseur || extractedData.supplier_name,
        amount: parseFloat(extractedData.montant_total || extractedData.total_amount),
        currency: extractedData.devise || extractedData.currency || 'XOF',
        dueDate: extractedData.date_echeance || extractedData.due_date,
        description: extractedData.description || '',
      };
    } catch (error) {
      console.error('Error extracting invoice data:', error);
      return this.getMockInvoiceData();
    }
  }

  async classifyExpense(description: string, amount: number): Promise<string> {
    if (!this.openaiApiKey) {
      return this.getMockCategory(description);
    }

    try {
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant comptable. Classifie les dépenses dans l\'une de ces catégories: alimentation, transport, logement, services, fournitures, equipement, marketing, autre. Réponds uniquement avec le nom de la catégorie.',
            },
            {
              role: 'user',
              content: `Classifie cette dépense: "${description}" pour un montant de ${amount} FCFA`,
            },
          ],
          max_tokens: 50,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
        },
      );

      const category = response.data.choices[0].message.content.trim().toLowerCase();
      return category || 'autre';
    } catch (error) {
      console.error('Error classifying expense:', error);
      return this.getMockCategory(description);
    }
  }

  async getAccountingAdvice(userData: any): Promise<string> {
    if (!this.openaiApiKey) {
      return 'Conseil: Pensez à organiser vos factures par catégorie pour mieux suivre vos dépenses.';
    }

    try {
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant comptable intelligent pour les PME en Côte d\'Ivoire. Donne des conseils financiers pertinents et pratiques.',
            },
            {
              role: 'user',
              content: `Donne 3 conseils financiers pour une entreprise avec: ${JSON.stringify(userData)}`,
            },
          ],
          max_tokens: 300,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error getting accounting advice:', error);
      return 'Conseil: Consultez un expert-comptable pour optimiser votre gestion financière.';
    }
  }

  private getMockInvoiceData(): any {
    return {
      invoiceNumber: 'FAC-2024-001',
      date: new Date().toISOString(),
      supplierName: 'Fournisseur Exemple SARL',
      amount: 150000,
      currency: 'XOF',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Prestation de services',
    };
  }

  private getMockCategory(description: string): string {
    const keywords: Record<string, string> = {
      'restaurant': 'alimentation',
      'repas': 'alimentation',
      'carburant': 'transport',
      'taxi': 'transport',
      'loyer': 'logement',
      'électricité': 'services',
      'eau': 'services',
      'internet': 'services',
      'papier': 'fournitures',
      'stylo': 'fournitures',
      'ordinateur': 'equipement',
      'publicité': 'marketing',
    };

    const lowerDesc = description.toLowerCase();
    for (const [keyword, category] of Object.entries(keywords)) {
      if (lowerDesc.includes(keyword)) {
        return category;
      }
    }

    return 'autre';
  }
}
